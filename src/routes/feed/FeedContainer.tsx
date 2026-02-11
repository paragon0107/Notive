"use client";

import { useMemo, useState } from "react";
import type { HomeConfig, PostSummary } from "@/libs/types/blog";
import { FeedView } from "@/routes/feed/FeedView";

type Props = {
  posts: PostSummary[];
  home: HomeConfig;
};

export const FeedContainer = ({ posts, home }: Props) => {
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    if (!normalized) return posts;
    return posts.filter((post) => post.searchText.includes(normalized));
  }, [posts, searchText]);

  return (
    <FeedView
      posts={filtered}
      searchText={searchText}
      onSearchChange={setSearchText}
      emptyMessage={
        searchText
          ? `No results for "${searchText}".`
          : "아직 게시된 글이 없습니다."
      }
      home={home}
    />
  );
};
