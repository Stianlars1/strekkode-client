import { About } from "@/features/about/about";
import Link from "next/link";
import "./css/navbar.css";

export const Navbar = () => {
  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Hovedmeny">
        <Link href="/" className="wordmark" aria-label="Strekkode - til forsiden">
          <span>stre</span>
          <span className="wordmark__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>kode</span>
        </Link>
        <ul>
          <li>
            <About />
          </li>
        </ul>
      </nav>
    </header>
  );
};
