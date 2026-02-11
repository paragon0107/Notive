import type { ReactNode } from "react";
import type { Category, HomeConfig, Post, TocItem } from "@/libs/types/blog";
import { Header } from "@/layouts/parts/Header";
import { LeftSidebar } from "@/layouts/parts/LeftSidebar";
import { RightSidebar } from "@/layouts/parts/RightSidebar";

type Props = {
  home: HomeConfig;
  tocItems?: TocItem[];
  relatedPosts?: Post[];
  rightCategories?: Category[];
  children: ReactNode;
};

export const MainLayout = ({
  home,
  tocItems,
  relatedPosts,
  rightCategories,
  children,
}: Props) => {
  return (
    <div className="page">
      <Header blogName={home.blogName} />
      <div className="layout">
        <aside className="sidebar-left">
          <LeftSidebar home={home} />
        </aside>
        <main className="main">{children}</main>
        <aside className="sidebar-right">
          <RightSidebar
            tocItems={tocItems}
            relatedPosts={relatedPosts}
            categories={rightCategories}
          />
        </aside>
      </div>
    </div>
  );
};
