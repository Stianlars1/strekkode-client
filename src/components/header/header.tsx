import "./css/header.css";
export const Header = () => {
  return (
    <header className="header">
      {/* <div className="header__skew-top" /> */}
      <h1 className="header__title">Lag strekkoder gratis og enkelt</h1>
      <p className="header__subtitle">
        Generer dine egne strekkoder raskt, uten kostnad. Perfekt for bedrifter
        og personlig bruk. Ingen registrering nødvendig.
      </p>
      {/* <div className="header__skew-bottom" /> */}
    </header>
  );
};
