import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Static assets (JS/CSS/images/fonts) are precached/cached for fast, app-like
  // loads. Pages and API routes are data-driven (batches, stock, orders) and are
  // intentionally NOT cached here, so users never see stale ERP data offline.
  runtimeCaching: [
    // /login is hit right as a freshly-installed service worker is claiming
    // clients (skipWaiting + clientsClaim) — that activation race can make
    // Workbox's NetworkFirst fallback-to-cache path throw "no-response" for
    // this URL on a brand new install, breaking the very first login.
    // Bypass the SW for it entirely; it's a low-traffic page with nothing
    // worth caching anyway.
    {
      matcher: ({ url }: { url: URL }) => url.pathname === "/login",
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
