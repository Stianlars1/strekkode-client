"use client";

import Script from "next/script";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ADSENSE_PUBLISHER, permitsAds } from "./consent";

const ConsentContext = createContext({
  canShowAds: false,
  openPreferences: (): boolean => false,
});

export const useAdConsent = () => useContext(ConsentContext);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    let disposed = false;
    let listenerId: number | undefined;
    window.googlefc ??= { callbackQueue: [] };
    window.googlefc.callbackQueue ??= [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => {
        if (disposed) return;
        window.__tcfapi?.("addEventListener", 2, (data, success) => {
          if (disposed) return;
          listenerId = data?.listenerId;
          setConsented(Boolean(data) && permitsAds(data, success));
        });
      },
    });

    return () => {
      disposed = true;
      if (listenerId !== undefined) {
        window.__tcfapi?.("removeEventListener", 2, () => {}, listenerId);
      }
    };
  }, []);

  const openPreferences = useCallback(() => {
    if (!window.googlefc?.showRevocationMessage) return false;
    setConsented(false);
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => window.googlefc?.showRevocationMessage?.(),
    });
    return true;
  }, []);

  return (
    <ConsentContext.Provider
      value={{ canShowAds: consented, openPreferences }}
    >
      {children}
      <iframe
        name="googlefcPresent"
        title="Samtykkeløsning"
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: "none", width: 0, height: 0, border: 0 }}
      />
      <Script
        id="google-consent"
        async
        src={`https://fundingchoicesmessages.google.com/i/${ADSENSE_PUBLISHER}?ers=1`}
        strategy="afterInteractive"
      />
    </ConsentContext.Provider>
  );
};
