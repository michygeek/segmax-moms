import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { canRead, type ModuleKey } from "@/lib/permissions";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login"];

const ROUTE_MODULE: { prefix: string; module: ModuleKey }[] = [
  { prefix: "/dashboard", module: "dashboard" },
  { prefix: "/production", module: "production" },
  { prefix: "/inventory", module: "inventory" },
  { prefix: "/quality", module: "quality" },
  { prefix: "/hr", module: "hr" },
  { prefix: "/sales", module: "sales" },
  { prefix: "/safety", module: "safety" },
  { prefix: "/admin", module: "admin" },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    if (req.auth && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const matched = ROUTE_MODULE.find((r) => pathname.startsWith(r.prefix));
  if (matched && !canRead(req.auth.user.role, matched.module)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
