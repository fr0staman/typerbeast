import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import {
  fallbackLng,
  languages,
  cookieName,
  headerName,
} from "@/app/i18n/settings";
import { COOKIE_NAME } from "@/app/hooks/getServerUser";

acceptLanguage.languages(languages as unknown as string[]);

export const config = {
  // Avoid matching for static files, API routes, etc.
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)",
  ],
};

const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Ignore paths with "icon" or "chrome"
  if (pathname.indexOf("icon") > -1 || pathname.indexOf("chrome") > -1) {
    return NextResponse.next();
  }

  if (
    !PUBLIC_PATHS.some(path => pathname.includes(path)) &&
    !req.cookies.has(COOKIE_NAME)
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let lng;
  // Try to get language from cookie
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  // If no cookie, check the Accept-Language header
  if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));
  // Default to fallback language if still undefined
  if (!lng) lng = fallbackLng;

  // Check if the language is already in the path
  const lngInPath = languages.find(loc => pathname.startsWith(`/${loc}`));

  const headers = new Headers(req.headers);
  headers.set(headerName, lngInPath || lng);

  // If the language is not in the path, redirect to include it
  if (!lngInPath && !pathname.startsWith("/_next")) {
    return NextResponse.redirect(
      new URL(`/${lng}${pathname}${req.nextUrl.search}`, req.url),
    );
  }

  // If a referer exists, try to detect the language from there and set the cookie accordingly
  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer") || "");
    const lngInReferer = languages.find(l =>
      refererUrl.pathname.startsWith(`/${l}`),
    );
    const response = NextResponse.next({ headers });
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next({ headers });
}
