# Notion 데이터 호출 상세 흐름

이 문서는 현재 코드 기준으로, **메인 페이지 접속 후 포스트 상세로 이동할 때** Notion API가 어떤 순서로 호출되는지와 페이지별 RTT(왕복 요청 수)를 정리한다.

기준 날짜: 2026-02-06

---

## 1) 공통 구조

### 1.1 Notion 클라이언트 생성
- 파일: `src/apis/notion/client.ts`
- `getNotionClient()`가 `@notionhq/client` 인스턴스를 싱글톤으로 생성/재사용
- 필수 envㅇ
  - `NOTION_TOKEN`
  - `NOTION_PAGE_ID` (루트 페이지)

### 1.2 데이터베이스 맵 조회 (Posts/Projects/Contacts/Home)
- 파일: `src/apis/notion/queries/database-map.ts`
- `getDatabaseMap()`
  1. `notion.blocks.children.list(block_id: NOTION_PAGE_ID)` 호출
  2. 루트 페이지 하위 `child_database` 블록에서 제목으로 DB ID 매핑
  3. `Posts`, `Projects`, `Contacts`, `Home` 4개 필수 검증
- 캐시: `databaseMapPromise` (프로세스 메모리)

### 1.3 DB 스키마/메타 조회
- 파일: `src/apis/notion/queries/schema.ts`
- `fetchDatabase(databaseId)` => `notion.databases.retrieve`
- 캐시: `databaseCache: Map<databaseId, Promise<DatabaseObjectResponse>>`
- `assertDatabaseSchema(...)`로 컬럼 타입 검증

### 1.4 실제 콘텐츠 조회 API
- 포스트/블록: `src/apis/notion/queries/posts.ts`
  - 목록/단건: `notion.databases.query`
  - 블록 본문: `notion.blocks.children.list` (재귀)
- 홈/프로필/프로젝트/컨택트: `src/apis/notion/queries/home.ts`
  - Home 1행: `notion.databases.query(page_size:1)`
  - Projects/Contacts: `notion.databases.query` 전건 조회 후 relation 필터
- 카테고리/시리즈 옵션: `src/apis/notion/queries/collections.ts`
  - Posts DB 메타에서 `Category`, `Series` 옵션 파생

---

## 2) 데이터 타입별 출처

- 포스트 목록/상세 메타: `Posts` DB
- 포스트 본문 블록: 각 포스트 페이지 ID 기준 `blocks.children.list`
- 카테고리:
  - 홈 우측 카테고리: `Home.CategoryList` (멀티셀렉트)
  - 카테고리 페이지 목록: `Posts.Category` 옵션
- 프로필 정보:
  - `Home` DB 1행의 `BlogName`, `AboutMe`, `ProfileName`, `ProfileImage`
- Projects/Contacts:
  - `Home` DB의 relation(`Projects`, `Contacts`)을 읽고
  - `Projects`/`Contacts` DB에서 실제 row 조회
  - relation이 비어 있으면 현재 구현은 **전체 row 조회 fallback**

---

## 3) 시나리오 A: 메인(`/`) 진입

### 3.1 페이지 진입 코드
- `src/app/page.tsx` -> `fetchHomePageData()` 호출
- `src/apis/notion/queries/index.ts` -> `fetchHomePageData`

### 3.2 병렬 호출
`fetchHomePageData()` 내부에서 병렬:
1. `fetchPosts()`
2. `fetchHomeConfig(getFallbackHomeConfig())`
3. `fetchCategories()`

### 3.3 세부 단계

#### 3.3.1 `fetchPosts()` (`src/apis/notion/queries/posts.ts`)
1. `ensurePostsDatabase()`
2. `getDatabaseMap()` (최초 1회면 루트 child DB 스캔)
3. `fetchDatabase(postsId)` + `assertDatabaseSchema(POSTS_SCHEMA)`
4. `queryAllPages(postsId, Published=true)`
5. page rows를 `mapPost`로 변환

#### 3.3.2 `fetchHomeConfig()` (`src/apis/notion/queries/home.ts`)
1. `ensureHomeDatabase()`
2. `getDatabaseMap()`
3. `fetchDatabase(homeId)`
4. `queryFirstRow(homeId)`
5. Home row에서 relation id 추출
6. `fetchProjects(projectIds)` + `fetchContacts(contactIds)` 병렬
7. `projects/contacts` 정렬 + Home 텍스트 필드 매핑

`fetchProjects`/`fetchContacts` 내부:
1. 각 DB ID 획득 (`getDatabaseMap`)
2. `fetchDatabase` + schema assert
3. `queryAllRows` 전건 조회
4. relation id가 있으면 필터, 없으면 전체 반환

#### 3.3.3 `fetchCategories()` (`src/apis/notion/queries/collections.ts`)
1. `getDatabaseMap()` -> postsId
2. `fetchDatabase(postsId)` + schema assert
3. DB property `Category` 옵션을 category 목록으로 매핑

### 3.4 메인 페이지 RTT

표기:
- `D`: 루트 페이지 child DB 조회 페이지 수 (`blocks.children.list`, 보통 1)
- `Q_posts`: Published 포스트 목록 query 페이지 수
- `Q_projects`: Projects DB row query 페이지 수
- `Q_contacts`: Contacts DB row query 페이지 수

#### Cold start(캐시 없음)
- RTT = `D + 5 + Q_posts + Q_projects + Q_contacts`
- `+5` 구성:
  - `databases.retrieve` 4회 (Posts/Home/Projects/Contacts)
  - `Home first row query` 1회

#### Typical(각 DB 100개 미만, D=1)
- `Q_posts=1`, `Q_projects=1`, `Q_contacts=1`이면
- RTT = `1 + 5 + 1 + 1 + 1 = 9`

#### Warm cache(프로세스 내 재요청)
- DB map/retrieve 캐시 사용 시
- RTT = `Q_posts + 1 + Q_projects + Q_contacts`
- Typical이면 `1 + 1 + 1 + 1 = 4`

---

## 4) 시나리오 B: 메인에서 포스트 상세(`/post/[slug]`) 이동

### 4.1 코드 진입
- 페이지: `src/app/post/[slug]/page.tsx`
- 호출 순서:
  1. `fetchPostBySlug(params.slug)` (존재 확인)
  2. 병렬: `fetchPostBlocks(post.id)`, `fetchPosts()`, `fetchHomeConfig()`
  3. TOC/이전다음/관련글 계산 후 렌더

### 4.2 상세 단계

#### 4.2.1 `fetchPostBySlug(slug)` (`posts.ts`)
1. `ensurePostsDatabase()`
2. `notion.databases.query(filter: Slug == slug, page_size:1)`

#### 4.2.2 `fetchPostBlocks(post.id)` (`posts.ts`)
1. 루트 블록 children 조회 (`listBlockChildren(postId)`)
2. 자식 있는 블록마다 `hydrateChildren` 재귀
3. 깊은 트리일수록 `blocks.children.list` 추가 호출

RTT 표기:
- `B_root`: 포스트 루트 children pagination 횟수
- `B_child`: 자식 블록 조회 호출 합(재귀 전체)
- 블록 RTT = `B_root + B_child`

#### 4.2.3 `fetchPosts()`
- 메인과 동일하게 Published 목록 query (`Q_posts`)

#### 4.2.4 `fetchHomeConfig()`
- 메인과 동일한 홈/프로젝트/컨택트 흐름 (`1 + Q_projects + Q_contacts` + 캐시 상태에 따라 retrieve 비용)

### 4.3 metadata 단계 추가 호출
`src/app/post/[slug]/page.tsx`의 `generateMetadata`도 `fetchPostBySlug`를 호출한다.
- 즉, 요청 컨텍스트에 따라 **slug query가 1회 더** 발생 가능

### 4.4 상세 페이지 RTT

#### Warm(메인 직후 같은 런타임, map/retrieve 캐시 있다고 가정)
- 페이지 본문 렌더 기준:
  - `1 (fetchPostBySlug)`
  - `+ (B_root + B_child)`
  - `+ Q_posts`
  - `+ (1 + Q_projects + Q_contacts)`
- 합계: `2 + Q_posts + Q_projects + Q_contacts + (B_root + B_child)`
- Typical(각 query 1회)이면: `5 + (B_root + B_child)`
- `generateMetadata`까지 포함하면 `+1` => `6 + (B_root + B_child)`

#### Cold(새 런타임)
- 위 식에 DB map/retrieve 초기 비용이 추가됨

---

## 5) 페이지별 호출 요약

### 5.1 `/` (Home)
- `fetchHomePageData`
  - `fetchPosts`
  - `fetchHomeConfig`
  - `fetchCategories`

### 5.2 `/posts`
- `fetchPosts`
- `fetchHomeConfig`
- 각 post마다 `fetchPostBlocks(post.id)` (N개)

### 5.3 `/post/[slug]`
- `fetchPostBySlug`
- `fetchPostBlocks(post.id)`
- `fetchPosts`
- `fetchHomeConfig`
- metadata에서도 `fetchPostBySlug`

### 5.4 `/category`
- `fetchCategories`
- `fetchHomeConfig`

### 5.5 `/category/[slug]`
- `fetchPosts`
- `fetchHomeConfig`
- `fetchCategories`
- 필터된 post마다 `fetchPostBlocks`
- metadata/static params에서 `fetchCategories`

### 5.6 `/series/[slug]`
- `fetchPosts`
- `fetchSeries`
- `fetchHomeConfig`
- 필터된 post마다 `fetchPostBlocks`
- metadata/static params에서 `fetchSeries`

---

## 6) 주의 포인트

1. `fetchPostBlocks`는 재귀 호출이라 포스트 블록 구조가 깊으면 RTT가 빠르게 늘어난다.
2. `generateMetadata`와 page 본문에서 같은 조회 함수를 중복 호출하는 라우트가 있다.
3. 현재 `fetchHomeConfig`의 projects/contacts는 relation 비어 있을 때 전체 조회 fallback이라, row가 많으면 메인 RTT 증가 원인이 된다.
4. 캐시는 메모리 기반(`Promise`/`Map`)이라 **서버 인스턴스가 바뀌면 cold start**가 다시 발생한다.

---

## 7) 빠른 참조 (핵심 파일)

- Notion client: `src/apis/notion/client.ts`
- DB map: `src/apis/notion/queries/database-map.ts`
- Schema/cache: `src/apis/notion/queries/schema.ts`
- Posts+Blocks: `src/apis/notion/queries/posts.ts`
- Home/Profile/Projects/Contacts: `src/apis/notion/queries/home.ts`
- Category/Series options: `src/apis/notion/queries/collections.ts`
- Home composition: `src/apis/notion/queries/index.ts`
- Main page: `src/app/page.tsx`
- Post detail page: `src/app/post/[slug]/page.tsx`
