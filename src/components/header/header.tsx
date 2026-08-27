import "./css/header.css";
export const Header = () => {
  return (
    <header className="header">
      {/* <div className="header__skew-top" /> */}
      <h1 className="header__title">Lag strekkoder gratis og enkelt</h1>
      <p className="header__subtitle">
        Velg format, skriv inn verdien og se strekkoden med en gang. Last ned
        som PNG eller SVG - helt gratis, uten registrering.
      </p>
      {/* <div className="header__skew-bottom" /> */}
    </header>
  );
};
