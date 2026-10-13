"use client";

import { useState } from "react";
import { useAdConsent } from "./consent-provider";

export const PrivacyPreferences = () => {
  const { openPreferences } = useAdConsent();
  const [unavailable, setUnavailable] = useState(false);

  return (
    <span>
      <button type="button" onClick={() => setUnavailable(!openPreferences())}>
        Endre samtykke
      </button>
      {unavailable && (
        <span className="footer__consent-status" role="status">
          Samtykkevalgene er ikke tilgjengelige akkurat nå. Ingen annonser lastes
          uten et gyldig samtykke.
        </span>
      )}
    </span>
  );
};
