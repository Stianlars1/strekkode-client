import { CompanyLogo } from "@/components/company-logo/company-logo";
import { COMPANY, CONTACT_HREF } from "@/utils/company";
import { FiMail } from "react-icons/fi";
import "./css/contact.css";

export const Contact = () => (
  <section className="contact" id="kontakt" aria-labelledby="contact-heading">
    <div className="contact__content">
      <a className="contact__company" href={COMPANY.url}>
        <CompanyLogo />
        <span>{COMPANY.name}</span>
      </a>
      <h2 id="contact-heading">Trenger du hjelp med strekkoder?</h2>
      <p>
        Skal du lage strekkoder til en bok, merke varer eller tilpasse etiketter?
        Ta kontakt med {COMPANY.name} for hjelp med filer og oppsett.
      </p>
    </div>
    <div className="contact__actions">
      <a className="contact__button" href={CONTACT_HREF}>
        <FiMail aria-hidden="true" />
        Spør om hjelp og pris
      </a>
      <a className="contact__email" href={CONTACT_HREF}>
        {COMPANY.email}
      </a>
    </div>
  </section>
);
