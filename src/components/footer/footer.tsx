import Image from "next/image";
import { FaEnvelope, FaGithub, FaInstagram } from "react-icons/fa";
import "./css/footer.css";

export const Footer = () => {
  return (
    <>
      <footer className="footer">
        <Copyright />

        <div className="social-links">
          <a
            href="https://stianlarsen.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nettsiden til Stian Larsen"
          >
            <Image
              src={"/stian-bitmoji.png"}
              width={24}
              height={24}
              alt="Tegnet portrett av Stian Larsen"
            />
            <span>Stian Larsen</span>
          </a>
          <a
            href="https://github.com/stianlars1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub-profilen til Stian Larsen"
          >
            <FaGithub />
            <span>/stianlars1</span>
          </a>
          <a
            href="https://instagram.com/stianlarsen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram-profilen til Stian Larsen"
          >
            <FaInstagram />
            <span>stianlarsen</span>
          </a>
          <a
            href="mailto:stian.larsen@mac.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Send e-post til Stian Larsen"
          >
            <FaEnvelope />
            <span>stian.larsen@mac.com</span>
          </a>
        </div>
      </footer>
    </>
  );
};

const Copyright = () => {
  const yearEstablished = 2024;
  const currentYear = new Date().getFullYear();

  return (
    <p>
      ©{" "}
      {yearEstablished !== currentYear
        ? `${yearEstablished} - ${currentYear}`
        : currentYear}{" "}
      Stian Larsen. All rights reserved.
    </p>
  );
};
