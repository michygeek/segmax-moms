import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { disableNavigationPreload, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Every strategy's fetch path (including NetworkOnly) unconditionally awaits
// `event.preloadResponse` first when navigation preload is active. It has
// known issues with *redirected* navigations specifically — and middleware
// redirects unauthenticated requests straight to /login?callbackUrl=..., which
// is exactly the request failing with a "no-response"/promise-rejected error.
// `navigationPreload: false` below only skips *enabling* it on a fresh
// install — browsers that already had it enabled by an earlier deploy keep it
// on across updates unless something explicitly disables it. Do that here.
disableNavigationPreload();

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
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
