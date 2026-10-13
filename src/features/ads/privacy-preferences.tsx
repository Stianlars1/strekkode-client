"use client";

import { useState } from "react";
import { useAdConsent } from "./consent-provider";

export const PrivacyPreferences = () => {
  const { canShowAds, openPreferences } = useAdConsent();
  const [requested, setRequested] = useState(false);

  return (
    <span>
      <button type="button" onClick={() => {
        openPreferences();
        setRequested(true);
      }}>
        Endre samtykke
      </button>
      {requested && !canShowAds && (
        <span className="footer__consent-status" role="status">
          Annonser er satt på pause. Hvis samtykkevinduet ikke åpnes, kan du
          fortsette å bruke generatoren uten annonser.
        </span>
      )}
    </span>
  );
};
