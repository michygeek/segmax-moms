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

// On activation, delete all caches that Serwist didn't create in this version.
// This prevents a stale-chunk ChunkLoadError: after a new deploy the page HTML
// (served fresh via NetworkOnly) references new chunk hashes, but without this
// the old SW cache would either serve the wrong file or miss entirely and time out.
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith("serwist-precache"))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  // Static assets (JS/CSS/images/fonts) are precached/cached for fast, app-like
  // loads. Pages and API routes are data-driven (batches, stock, orders) and are
  // intentionally NOT cached here, so users never see stale ERP data offline.
  //
  // Page *navigations* specifically are excluded from SW handling entirely
  // (not just cached-vs-not — bypassed outright). Several narrower attempts
  // at this (bypassing only /login, disabling navigation preload) didn't
  // stop a "no-response"/promise-rejected error on the post-login redirect,
  // so rather than keep chasing which exact Workbox internal is responsible,
  // every navigation now skips the SW's fetch handling and goes straight to
  // the network like a SW was never there. This costs nothing here — pages
  // were never meant to be cached anyway.
  runtimeCaching: [
    {
      matcher: ({ request }: { request: Request }) => request.mode === "navigate",
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
