import Link from "next/link";
import type { Post } from "@/libs/types/blog";
import { formatDate, estimateReadingMinutes } from "@/libs/format";
import { renderBlocks } from "@/libs/notion/renderer";
import type { BlockNode } from "@/libs/notion/blocks";
import { extractPlainText } from "@/libs/notion/blocks";
import { notionColorClass } from "@/libs/notion/colors";

const buildBreadcrumbs = (post: Post) => {
  const category = post.categories[0];
  return [
    { label: "Home", href: "/" },
    category
      ? { label: category.name, href: `/category/${category.slug}` }
      : { label: "Posts", href: "/posts" },
    { label: post.title, href: `/post/${post.slug}` },
  ];
};

type Props = {
  post: Post;
  blocks: BlockNode[];
  previous?: Post;
  next?: Post;
  relatedPosts: Post[];
};

export const PostDetailView = ({
  post,
  blocks,
  previous,
  next,
  relatedPosts,
}: Props) => {
  const readingMinutes = estimateReadingMinutes(extractPlainText(blocks));

  return (
    <article className="post-detail">
      <nav className="breadcrumbs">
        {buildBreadcrumbs(post).map((crumb, index) => (
          <span key={crumb.href}>
            <Link href={crumb.href}>{crumb.label}</Link>
            {index < 2 ? " > " : ""}
          </span>
        ))}
      </nav>

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

      <section className="post-detail__content">{renderBlocks(blocks)}</section>

      {post.series ? (
        <section className="post-detail__series">
          <div className="meta">Series</div>
          <Link href={`/series/${post.series.slug}`}>{post.series.name}</Link>
        </section>
      ) : null}

      <section className="post-detail__nav">
        {previous ? (
          <Link href={`/post/${previous.slug}`}>← {previous.title}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/post/${next.slug}`}>{next.title} →</Link>
        ) : (
          <span />
        )}
      </section>

      {relatedPosts.length > 0 ? (
        <section className="post-detail__related">
          <h3>Related Posts</h3>
          <ul>
            {relatedPosts.map((related) => (
              <li key={related.id}>
                <Link href={`/post/${related.slug}`}>{related.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

    </article>
  );
};
