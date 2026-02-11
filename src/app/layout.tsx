import "./globals.css";
import type { Metadata } from "next";
import { buildMetadata } from "@/libs/seo";
import { pretendard } from "@/assets/fonts";

export const metadata: Metadata = buildMetadata({});

const themeInitScript = `
  (function () {
    try {
      var savedTheme = localStorage.getItem("theme");
      var isSavedThemeValid = savedTheme === "light" || savedTheme === "dark";
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var resolvedTheme = isSavedThemeValid ? savedTheme : (prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", resolvedTheme);
    } catch (error) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={pretendard.className}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
