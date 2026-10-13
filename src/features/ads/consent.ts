export const ADSENSE_PUBLISHER = "pub-7638629114587725";
export const ADSENSE_CLIENT = `ca-${ADSENSE_PUBLISHER}`;
export const ADSENSE_SLOT = "1625766726";

export interface ConsentData {
  cmpStatus?: string;
  eventStatus?: string;
  listenerId?: number;
  purpose?: { consents?: Record<number, boolean> };
  vendor?: { consents?: Record<number, boolean> };
}

export const permitsAds = (data: ConsentData, success: boolean): boolean =>
  success &&
  data.cmpStatus === "loaded" &&
  (data.eventStatus === "tcloaded" || data.eventStatus === "useractioncomplete") &&
  data.purpose?.consents?.[1] === true &&
  data.vendor?.consents?.[755] === true;

declare global {
  interface Window {
    googlefc?: {
      callbackQueue: Record<string, () => void>[];
      showRevocationMessage?: () => void;
    };
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: ConsentData, success: boolean) => void,
      parameter?: number
    ) => void;
    adsbygoogle?: Record<string, unknown>[] & { pauseAdRequests?: number };
  }
}
