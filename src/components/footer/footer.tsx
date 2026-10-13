import { CompanyLogo } from "@/components/company-logo/company-logo";
import { COMPANY, CONTACT_HREF } from "@/utils/company";
import "./css/footer.css";

export const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">
      <a className="footer__owner" href={COMPANY.url}>
        <CompanyLogo />
        <span>
          <span className="footer__eyebrow">Strek-kode.no er et produkt fra</span>
          <strong>{COMPANY.name}</strong>
        </span>
      </a>
      <div className="footer__details">
        <a href={CONTACT_HREF}>Kontakt {COMPANY.name}</a>
        <p>© 2024–{new Date().getFullYear()} {COMPANY.name}</p>
      </div>
    </div>
  </footer>
);
