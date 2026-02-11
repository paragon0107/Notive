import Link from "next/link";
import type { Category, TocItem } from "@/libs/types/blog";

type Props = {
  tocItems?: TocItem[];
  categories?: Category[];
  categoryFilterPath?: string;
  activeCategorySlug?: string;
};

export const LeftSidebar = ({
  tocItems = [],
  categories = [],
  categoryFilterPath,
  activeCategorySlug,
}: Props) => {
  const isCategoryFilterMode = Boolean(categoryFilterPath);
  const allHref = categoryFilterPath ?? "/";

  return (
    <div className="sidebar-left__inner">
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

      {categories.length > 0 ? (
        <section className="category-menu">
          <h3>Categories</h3>
          <ul>
            {isCategoryFilterMode ? (
              <li>
                <Link
                  href={allHref}
                  className={!activeCategorySlug ? "is-active" : undefined}
                  title="전체"
                >
                  전체
                </Link>
              </li>
            ) : null}
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={
                    isCategoryFilterMode
                      ? `${categoryFilterPath}?category=${encodeURIComponent(category.slug)}`
                      : `/category/${category.slug}`
                  }
                  className={
                    activeCategorySlug === category.slug ? "is-active" : undefined
                  }
                  title={category.name}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
