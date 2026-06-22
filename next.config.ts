import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() || randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  // Skip the service worker entirely in dev so cached chunks/styles never mask
  // hot-reloaded code while developing.
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
