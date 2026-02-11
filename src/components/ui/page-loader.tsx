import { Component } from "@/components/ui/luma-spin";

export function PageLoader() {
  return (
    <div
      className="feed__empty"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <Component />
    </div>
  );
}
