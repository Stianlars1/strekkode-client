import { About } from "@/features/about/about";
import Image from "next/image";
import Link from "next/link";
import "./css/navbar.css";

export const Navbar = () => {
  return (
    <div className="navbar">
      <Link href={"#"}>
        <Image
          src={"/strekkode.png"}
          alt="The logo for strekkode"
          width={50}
          height={50}
        />
      </Link>
      <ul>
        <li>
          <About />
        </li>
      </ul>
    </div>
  );
};
