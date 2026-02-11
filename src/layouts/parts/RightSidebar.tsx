import Link from "next/link";
import type { Category, Post, TocItem } from "@/libs/types/blog";

type Props = {
  tocItems?: TocItem[];
  relatedPosts?: Post[];
  categories?: Category[];
};

export const RightSidebar = ({
  tocItems = [],
  relatedPosts = [],
  categories = [],
}: Props) => {
  return (
    <div className="sidebar-right__inner">
      {tocItems.length > 0 ? (
        <section className="toc">
          <h3>Table of Contents</h3>
          <div className="toc__list">
            <div className="toc__line" />
            <ul>
              {tocItems.map((item) => (
                <li key={item.id} className={`toc__item level-${item.level}`}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="related">
          <h3>Related Posts</h3>
          <ul>
            {relatedPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/post/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section className="category-menu">
          <h3>Categories</h3>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
