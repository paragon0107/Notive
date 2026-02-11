"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/libs/types/blog";
import { ThemeToggle } from "@/layouts/parts/ThemeToggle";

type Props = {
  blogName: string;
  categories: Category[];
};

export const Header = ({ blogName, categories }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const visibleCategories = categories.filter((category) => category.name.trim().length > 0);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo">
          <Link href="/">{blogName}</Link>
        </div>
        <nav className="header__nav">
          <ThemeToggle />
          <button
            type="button"
            className={`header__menu-toggle ${isMenuOpen ? "is-open" : ""}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="header-menu-panel"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>

      <button
        type="button"
        className={`header__menu-backdrop ${isMenuOpen ? "is-open" : ""}`}
        aria-label="Close menu"
        onClick={closeMenu}
      />

      <aside
        id="header-menu-panel"
        className={`header__menu-panel ${isMenuOpen ? "is-open" : ""}`}
      >
        <div className="header__menu-head">
          <strong>Menu</strong>
          <button type="button" onClick={closeMenu} aria-label="Close menu">
            Close
          </button>
        </div>
        <div className="header__menu-section">
          <Link href="/" onClick={closeMenu}>Home</Link>
        </div>
        <div className="header__menu-title">Categories</div>
        <div className="header__menu-section">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              onClick={closeMenu}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </aside>
    </header>
  );
};
