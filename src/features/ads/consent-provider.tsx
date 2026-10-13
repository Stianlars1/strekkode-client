"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ADSENSE_CLIENT, permitsAds } from "./consent";

const ConsentContext = createContext({
  canShowAds: false,
  openPreferences: (): boolean => false,
});

export const useAdConsent = () => useContext(ConsentContext);

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consented, setConsented] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const isGeneratorPage = usePathname() === "/";

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
          const granted = Boolean(data) && permitsAds(data, success);
          if (!granted) (window.adsbygoogle ??= []).pauseAdRequests = 1;
          setConsented(granted);
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

  useEffect(() => {
    (window.adsbygoogle ??= []).pauseAdRequests =
      consented && isGeneratorPage ? 0 : 1;
  }, [consented, isGeneratorPage]);

  const openPreferences = useCallback(() => {
    (window.adsbygoogle ??= []).pauseAdRequests = 1;
    setConsented(false);
    if (!window.googlefc?.showRevocationMessage) return false;
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => window.googlefc?.showRevocationMessage?.(),
    });
    return true;
  }, []);

  return (
    <ConsentContext.Provider
      value={{
        canShowAds: consented && scriptReady && isGeneratorPage,
        openPreferences,
      }}
    >
      {children}
      <Script
        id="google-adsense"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptReady(false)}
      />
    </ConsentContext.Provider>
  );
};
