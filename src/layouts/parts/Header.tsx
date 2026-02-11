import Link from "next/link";

type Props = {
  blogName: string;
};

export const Header = ({ blogName }: Props) => {
  return (
    <header className="header">
      <div className="header__logo">
        <Link href="/">{blogName}</Link>
      </div>
      <nav className="header__nav">
        <Link href="/">Home</Link>
        <Link href="/category">About</Link>
        <Link href="/posts">Archives</Link>
      </nav>
    </header>
  );
};
