import Link from "next/link";
import type { Post } from "@/libs/types/blog";
import { formatDate, estimateReadingMinutes } from "@/libs/format";
import { renderBlocks } from "@/libs/notion/renderer";
import type { BlockNode } from "@/libs/notion/blocks";
import { extractPlainText } from "@/libs/notion/blocks";
import { notionColorClass } from "@/libs/notion/colors";
import { Component as LoaderSpinner } from "@/components/ui/luma-spin";

type Props = {
  post: Post;
  blocks: BlockNode[];
  relatedPosts: Post[];
  isContentLoading?: boolean;
};

export const PostDetailView = ({
  post,
  blocks,
  relatedPosts,
  isContentLoading = false,
}: Props) => {
  const readingMinutes = estimateReadingMinutes(extractPlainText(blocks));
  return (
    <article className="post-detail">
      <header className="post-detail__header">
        <h1>{post.title}</h1>
        <div className="meta">
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{readingMinutes} min read</span>
          {post.authorNames.length > 0 ? (
            <>
              <span>·</span>
              <span>{post.authorNames.join(", ")}</span>
            </>
          ) : null}
        </div>
        {post.categories.length > 0 ? (
          <div className="post-detail__categories">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`category-pill ${notionColorClass(category.color)}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : null}
        {post.thumbnailUrl ? (
          <div className="post-detail__hero">
            <img src={post.thumbnailUrl} alt="" />
          </div>
        ) : null}
      </header>

      <section className="post-detail__content">
        {isContentLoading ? (
          <div className="post-detail__content-loading" aria-busy="true">
            <LoaderSpinner />
          </div>
        ) : (
          renderBlocks(blocks)
        )}
      </section>

      <section className="post-detail__related">
        <h3>Related Posts</h3>
        {relatedPosts.length > 0 ? (
          <ul>
            {relatedPosts.map((related) => (
              <li key={related.id} className="post-detail__related-item">
                <Link href={`/post/${related.slug}`}>{related.title}</Link>
                <p className="post-detail__related-summary">
                  {related.summary ?? ""}
                </p>
                {related.date ? (
                  <span className="post-detail__related-date">
                    {formatDate(related.date)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="post-detail__related-empty" aria-hidden="true" />
        )}
      </section>

    </article>
  );
};
