# notive

## English

A Next.js blog service that uses Notion pages as a CMS.  
Manage posts, categories, profile, and project/contact information in Notion and publish them to the web.

### Features

- Notion-based content management
  - Update posts/profile/categories directly in Notion without code deployment
- Core blog screens
  - Home feed (`/`)
  - Post detail (`/post/[slug]`)
  - Category list/detail (`/category`, `/category/[slug]`)
- Post discovery features
  - Search
  - Category filter
  - Related posts (series/category based)
  - TOC (Table of Contents)
- SEO basics
  - Generate Open Graph/Twitter metadata
  - Dynamically generate `sitemap.xml`
- API routes
  - `/api/blog/bootstrap`
  - `/api/blog/database-map`
  - `/api/blog/post/[slug]`

### Tech Stack

- Next.js 14
- React 18
- TypeScript
- Zustand
- `@notionhq/client`

### Notion Setup

`NOTION_PAGE_ID` must be the **root page ID**, and the four databases below must exist as child databases under that root page.

- `Posts`
- `Projects`
- `Contacts`
- `Home`

Database names are referenced directly in code, so they must match exactly.

### Required Schema

#### `Posts`

| Property | Type |
| --- | --- |
| `Title` | `title` |
| `Slug` | `rich_text` |
| `Published` | `checkbox` |
| `Date` | `date` |
| `Summary` | `rich_text` |
| `Thumbnail` | `files` |
| `Category` | `multi_select` |
| `Series` | `relation` |
| `Author` | `people` |

#### `Projects`

| Property | Type |
| --- | --- |
| `Name` | `title` |
| `Icon` | `files` |
| `Link` | `url` |
| `Order` | `number` |

#### `Contacts`

| Property | Type |
| --- | --- |
| `Name` | `title` |
| `Value` | `rich_text` |
| `Icon` | `files` |
| `Order` | `number` |

#### `Home`

| Property | Type |
| --- | --- |
| `Name` | `title` |
| `BlogName` | `rich_text` |
| `AboutMe` | `rich_text` |
| `ProfileName` | `rich_text` |
| `ProfileImage` | `files` |
| `CategoryList` | `multi_select` |
| `Projects` | `relation` |
| `Contacts` | `relation` |
| `UseNotionProfileAsDefault` | `checkbox` |

### Getting Started

#### 1) Install

```bash
npm install
```

#### 2) Environment Variables

Create a `.env.local` file in the project root.

```bash
NOTION_TOKEN=secret_xxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Required: `NOTION_TOKEN`, `NOTION_PAGE_ID`

#### 2-1) How to Get `NOTION_TOKEN` and `NOTION_PAGE_ID`

1. Create a Notion integration.
   - Go to Notion: `Settings & members` -> `Connections` -> `Develop or manage integrations`.
   - Create a new internal integration.
2. Copy the integration token.
   - In the integration page, copy the Internal Integration Token.
   - Set it as `NOTION_TOKEN` in `.env.local`.
3. Connect the integration to your root page.
   - Open the root Notion page for this project.
   - Click `Share` and invite your integration.
   - Make sure child databases (`Posts`, `Projects`, `Contacts`, `Home`) are accessible by that integration.
4. Copy the root page ID.
   - Open the root page in the browser and copy the page ID from the URL.
   - Set it as `NOTION_PAGE_ID` in `.env.local`.

#### 3) Run

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Deploy (Vercel)

1. Import this repository into a Vercel project.
2. Configure Environment Variables.
   - `NOTION_TOKEN` (required)
   - `NOTION_PAGE_ID` (required)
3. Run deployment.

### Project Structure

```text
src/
  apis/        # External API/Notion integration
  app/         # Next.js app router (page, api, sitemap)
  layouts/     # Layouts and shared UI shells
  libs/        # Domain logic/utilities/types/state
  routes/      # Page-specific UI composition (Container/View)
```

### Docs

- Architecture guide: `docs/architecture-guide.md`
- Notion data flow note: `docs/notion-data-flow.md`

### Troubleshooting

- `Missing Notion databases` error:
  - Verify `Posts`, `Projects`, `Contacts`, and `Home` exist under the root page.
- `schema mismatch` error:
  - Verify DB property names/types match the schema in this README.
- If data appears empty:
  - Verify `Posts.Published` is checked.
  - Verify the Notion integration is connected to the target page/databases.

---

## 한국어

Notion 페이지를 CMS로 사용하는 Next.js 블로그 서비스입니다.  
포스트, 카테고리, 프로필, 프로젝트/연락처 정보를 Notion에서 관리하고 웹에 반영합니다.

### 주요 기능

- Notion 기반 콘텐츠 관리
  - 코드 배포 없이 Notion에서 글/프로필/카테고리 수정
- 블로그 핵심 화면 제공
  - 홈 피드 (`/`)
  - 포스트 상세 (`/post/[slug]`)
  - 카테고리 목록/상세 (`/category`, `/category/[slug]`)
- 포스트 탐색 기능
  - 검색
  - 카테고리 필터
  - 관련 글 (시리즈/카테고리 기반)
  - TOC (Table of Contents)
- SEO 기본 구성
  - Open Graph/Twitter 메타 생성
  - `sitemap.xml` 동적 생성
- API 라우트 제공
  - `/api/blog/bootstrap`
  - `/api/blog/database-map`
  - `/api/blog/post/[slug]`

### 기술 스택

- Next.js 14
- React 18
- TypeScript
- Zustand
- `@notionhq/client`

### Notion 설정

`NOTION_PAGE_ID`는 **루트 페이지 ID**여야 하며, 아래 4개 DB가 루트 페이지의 하위 DB로 있어야 합니다.

- `Posts`
- `Projects`
- `Contacts`
- `Home`

DB 이름은 코드에서 그대로 참조하므로 정확히 일치해야 합니다.

### 필수 스키마

#### `Posts`

| Property | Type |
| --- | --- |
| `Title` | `title` |
| `Slug` | `rich_text` |
| `Published` | `checkbox` |
| `Date` | `date` |
| `Summary` | `rich_text` |
| `Thumbnail` | `files` |
| `Category` | `multi_select` |
| `Series` | `relation` |
| `Author` | `people` |

#### `Projects`

| Property | Type |
| --- | --- |
| `Name` | `title` |
| `Icon` | `files` |
| `Link` | `url` |
| `Order` | `number` |

#### `Contacts`

| Property | Type |
| --- | --- |
| `Name` | `title` |
| `Value` | `rich_text` |
| `Icon` | `files` |
| `Order` | `number` |

#### `Home`

| Property | Type |
| --- | --- |
| `Name` | `title` |
| `BlogName` | `rich_text` |
| `AboutMe` | `rich_text` |
| `ProfileName` | `rich_text` |
| `ProfileImage` | `files` |
| `CategoryList` | `multi_select` |
| `Projects` | `relation` |
| `Contacts` | `relation` |
| `UseNotionProfileAsDefault` | `checkbox` |

### 시작하기

#### 1) 설치

```bash
npm install
```

#### 2) 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```bash
NOTION_TOKEN=secret_xxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- 필수: `NOTION_TOKEN`, `NOTION_PAGE_ID`

#### 2-1) `NOTION_TOKEN` / `NOTION_PAGE_ID` 발급 방법

1. Notion Integration을 생성합니다.
   - Notion에서 `Settings & members` -> `Connections` -> `Develop or manage integrations`로 이동합니다.
   - Internal Integration을 새로 생성합니다.
2. Integration 토큰을 복사합니다.
   - Integration 페이지에서 Internal Integration Token을 복사합니다.
   - `.env.local`의 `NOTION_TOKEN`에 넣습니다.
3. 루트 페이지에 Integration 권한을 연결합니다.
   - 프로젝트의 루트 Notion 페이지를 엽니다.
   - `Share`에서 생성한 Integration을 초대합니다.
   - 하위 DB(`Posts`, `Projects`, `Contacts`, `Home`)도 해당 Integration이 접근 가능해야 합니다.
4. 루트 페이지 ID를 복사합니다.
   - 브라우저에서 루트 페이지 URL을 열고 page ID를 복사합니다.
   - `.env.local`의 `NOTION_PAGE_ID`에 넣습니다.

#### 3) 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

### 배포 (Vercel)

1. 저장소를 Vercel 프로젝트로 Import합니다.
2. Environment Variables를 설정합니다.
   - `NOTION_TOKEN` (필수)
   - `NOTION_PAGE_ID` (필수)
3. 배포를 실행합니다.

### 프로젝트 구조

```text
src/
  apis/        # 외부 API/Notion 연동
  app/         # Next.js app router (page, api, sitemap)
  layouts/     # 레이아웃 및 공통 UI 골격
  libs/        # 도메인 로직/유틸/타입/상태
  routes/      # 페이지별 UI 조합(Container/View)
```

### 문서

- 아키텍처 가이드: `docs/architecture-guide.md`
- Notion 데이터 흐름 문서: `docs/notion-data-flow.md`

### 문제 해결

- `Missing Notion databases` 오류:
  - 루트 페이지 하위에 `Posts`, `Projects`, `Contacts`, `Home` DB가 있는지 확인
- `schema mismatch` 오류:
  - DB property 이름/타입이 README의 스키마와 일치하는지 확인
- 데이터가 비어 보이는 경우:
  - `Posts.Published`가 체크되어 있는지 확인
  - Notion Integration이 해당 페이지/DB에 연결되어 있는지 확인
