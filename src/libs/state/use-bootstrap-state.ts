"use client";

import { useEffect } from "react";
import type { BlogBootstrapPayload } from "@/libs/types/blog-store";
import { useBlogStore } from "@/libs/state/blog-store";

const BOOTSTRAP_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const PROFILE_IMAGE_REFRESH_BUFFER_MS = 1000;

const parseExpiryTime = (value?: string) => {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return timestamp;
};

export const useBootstrapState = (initialBootstrap?: BlogBootstrapPayload) => {
  const home = useBlogStore((state) => state.home);
  const isBootstrapLoading = useBlogStore((state) => state.isBootstrapLoading);
  const errorMessage = useBlogStore((state) => state.errorMessage);
  const ensureBootstrap = useBlogStore((state) => state.ensureBootstrap);
  const hydrateBootstrap = useBlogStore((state) => state.hydrateBootstrap);

  useEffect(() => {
    if (!initialBootstrap) return;
    hydrateBootstrap(initialBootstrap);
  }, [hydrateBootstrap, initialBootstrap]);

  useEffect(() => {
    void ensureBootstrap();
  }, [ensureBootstrap]);

  useEffect(() => {
    const refresh = () => {
      void ensureBootstrap();
    };

    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    const intervalId = window.setInterval(refresh, BOOTSTRAP_REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [ensureBootstrap]);

  useEffect(() => {
    if (!home?.profileImageUrl) return;
    const expiryAt = parseExpiryTime(home.profileImageExpiryTime);
    if (!expiryAt) return;

    const refreshProfileImage = () => {
      void ensureBootstrap(true);
    };

    const delay = expiryAt - Date.now();
    if (delay <= 0) {
      refreshProfileImage();
      return;
    }

    const timerId = window.setTimeout(
      refreshProfileImage,
      delay + PROFILE_IMAGE_REFRESH_BUFFER_MS
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [home?.profileImageUrl, home?.profileImageExpiryTime, ensureBootstrap]);

  return {
    home,
    isBootstrapLoading,
    errorMessage,
    ensureBootstrap,
  };
};
