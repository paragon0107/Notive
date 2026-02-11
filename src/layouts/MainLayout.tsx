import type { ReactNode } from "react";
import type { Category, HomeConfig, TocItem } from "@/libs/types/blog";
import { Header } from "@/layouts/parts/Header";
import { LeftSidebar } from "@/layouts/parts/LeftSidebar";
import { RightSidebar } from "@/layouts/parts/RightSidebar";

type Props = {
  home: HomeConfig;
  tocItems?: TocItem[];
  leftCategories?: Category[];
  categoryFilterPath?: string;
  activeCategorySlug?: string;
  rightPanelMode?: "profile" | "toc";
  children: ReactNode;
};

export const MainLayout = ({
  home,
  tocItems,
  leftCategories,
  categoryFilterPath,
  activeCategorySlug,
  rightPanelMode = "profile",
  children,
}: Props) => {
  const renderDefaultLeftSidebar = () => (
    <LeftSidebar
      tocItems={tocItems}
      categories={leftCategories}
      categoryFilterPath={categoryFilterPath}
      activeCategorySlug={activeCategorySlug}
    />
  );

  const renderRightTocSidebar = () => <LeftSidebar tocItems={tocItems} />;

  const renderCategoryLeftSidebar = () => (
    <LeftSidebar
      categories={leftCategories}
      categoryFilterPath={categoryFilterPath}
      activeCategorySlug={activeCategorySlug}
    />
  );

  return (
    <div className="page">
      <Header blogName={home.blogName} categories={home.categories} />
      <div className="layout">
        <aside className="sidebar-left">
          {rightPanelMode === "toc" ? renderCategoryLeftSidebar() : renderDefaultLeftSidebar()}
        </aside>
        <main className="main">{children}</main>
        <aside className="sidebar-right">
          {rightPanelMode === "toc" ? renderRightTocSidebar() : <RightSidebar home={home} />}
        </aside>
      </div>
    </div>
  );
};
