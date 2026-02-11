import Link from "next/link";
import type { HomeConfig, PostSummary } from "@/libs/types/blog";
import { formatDate, estimateReadingMinutes } from "@/libs/format";

const getReadingTimeLabel = (text: string) => {
  const minutes = estimateReadingMinutes(text);
  return `${minutes} min read`;
};

type Props = {
  posts: PostSummary[];
  searchText: string;
  onSearchChange: (value: string) => void;
  emptyMessage: string;
  home: HomeConfig;
};

export const FeedView = ({
  posts,
  searchText,
  onSearchChange,
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
            <article className="feed__item" key={post.id}>
              <div className="feed__text">
                <h2>
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.summary ? <p>{post.summary}</p> : null}
                <div className="meta">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <span>{getReadingTimeLabel(post.searchText)}</span>
                </div>
              </div>
              <div className="feed__thumb">
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt="" />
                ) : (
                  <div className="feed__thumb-placeholder" />
                )}
              </div>
            </article>
          ))}
        </div>
      )}

    </section>
  );
};
