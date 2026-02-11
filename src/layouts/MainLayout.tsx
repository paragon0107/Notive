import type { ReactNode } from "react";
import type { Category, HomeConfig, TocItem } from "@/libs/types/blog";
import { Header } from "@/layouts/parts/Header";
import { LeftSidebar } from "@/layouts/parts/LeftSidebar";
import { RightSidebar } from "@/layouts/parts/RightSidebar";

type Props = {
  home: HomeConfig;
  tocItems?: TocItem[];
  rightCategories?: Category[];
  categoryFilterPath?: string;
  activeCategorySlug?: string;
  rightPanelMode?: "profile" | "toc";
  children: ReactNode;
};

export const MainLayout = ({
  home,
  tocItems,
  rightCategories,
  categoryFilterPath,
  activeCategorySlug,
  rightPanelMode = "profile",
  children,
}: Props) => {
  const renderDefaultSidebar = () => (
    <RightSidebar
      tocItems={tocItems}
      categories={rightCategories}
      categoryFilterPath={categoryFilterPath}
      activeCategorySlug={activeCategorySlug}
    />
  );

  const renderTocSidebar = () => <RightSidebar tocItems={tocItems} />;

  const renderCategorySidebar = () => (
    <RightSidebar
      categories={rightCategories}
      categoryFilterPath={categoryFilterPath}
      activeCategorySlug={activeCategorySlug}
    />
  );

  return (
    <div className="page">
      <Header blogName={home.blogName} categories={home.categories} />
      <div className="layout">
        <aside className="sidebar-left">
          {rightPanelMode === "toc" ? renderCategorySidebar() : renderDefaultSidebar()}
        </aside>
        <main className="main">{children}</main>
        <aside className="sidebar-right">
          {rightPanelMode === "toc" ? renderTocSidebar() : <LeftSidebar home={home} />}
        </aside>
      </div>
    </div>
  );
};
