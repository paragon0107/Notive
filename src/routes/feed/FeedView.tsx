import Link from "next/link";
import type { HomeConfig, PostSummary } from "@/libs/types/blog";
import { formatDate } from "@/libs/format";
import { notionColorClass } from "@/libs/notion/colors";

type Props = {
  posts: PostSummary[];
  searchText: string;
  onSearchChange: (value: string) => void;
  onPostClick: (slug: string) => void;
  emptyMessage: string;
  home: HomeConfig;
};

export const FeedView = ({
  posts,
  searchText,
  onSearchChange,
  onPostClick,
  emptyMessage,
  home,
}: Props) => {
  return (
    <section className="feed">
      <div className="feed__search">
        <span className="feed__search-icon">⌕</span>
        <input
          type="search"
          placeholder="Search posts"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {posts.length === 0 ? (
        <div className="feed__empty">{emptyMessage}</div>
      ) : (
        <div className="feed__list">
          {posts.map((post) => (
            <article
              className="feed__item"
              key={post.id}
              role="link"
              tabIndex={0}
              onClick={() => onPostClick(post.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onPostClick(post.slug);
                }
              }}
            >
              <div className="feed__text">
                <h2>
                  <Link
                    href={`/post/${post.slug}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.summary ? <p>{post.summary}</p> : null}
                <div className="feed__meta-group">
                  {post.categories.length > 0 ? (
                    <div className="feed__categories">
                      {post.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          onClick={(event) => event.stopPropagation()}
                          className={`category-pill ${notionColorClass(category.color)}`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <div className="meta">
                    <span>{formatDate(post.date)}</span>
                  </div>
                </div>
              </div>
              {post.thumbnailUrl ? (
                <div className="feed__thumb">
                  <img src={post.thumbnailUrl} alt="" />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

    </section>
  );
};
