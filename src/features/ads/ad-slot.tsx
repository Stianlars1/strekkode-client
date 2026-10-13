"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "./consent";
import { useAdConsent } from "./consent-provider";
import styles from "./ad-slot.module.css";

const ConsentedAd = () => {
  const element = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (requested.current || !element.current?.offsetWidth) return;
      requested.current = true;
      try {
        (window.adsbygoogle ??= []).push({});
      } catch {
        setFailed(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (failed) return null;

  return (
    <aside className={styles.slot} aria-label="Annonse">
      <span className={styles.label}>Annonse</span>
      <style>{`
        .strekkode_banner { display: block; width: 234px; height: 60px; }
        @media (min-width: 360px) { .strekkode_banner { width: 320px; height: 100px; } }
        @media (min-width: 520px) { .strekkode_banner { width: 468px; height: 60px; } }
        @media (min-width: 800px) { .strekkode_banner { width: 728px; height: 90px; } }
      `}</style>
      <ins
        ref={element}
        className="adsbygoogle strekkode_banner"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
      />
    </aside>
  );
};

export const AdSlot = () => {
  const { canShowAds } = useAdConsent();
  const [scriptReady, setScriptReady] = useState(false);
  if (!canShowAds) return null;

  return (
    <>
      <Script
        id="google-adsense"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptReady(false)}
      />
      {scriptReady && <ConsentedAd />}
    </>
  );
};
