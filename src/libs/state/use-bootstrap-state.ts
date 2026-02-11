"use client";

import { useEffect } from "react";
import { useBlogStore } from "@/libs/state/blog-store";

export const useBootstrapState = () => {
  const home = useBlogStore((state) => state.home);
  const isBootstrapLoading = useBlogStore((state) => state.isBootstrapLoading);
  const errorMessage = useBlogStore((state) => state.errorMessage);
  const ensureBootstrap = useBlogStore((state) => state.ensureBootstrap);

  useEffect(() => {
    void ensureBootstrap();
  }, [ensureBootstrap]);

  return {
    home,
    isBootstrapLoading,
    errorMessage,
    ensureBootstrap,
  };
};
