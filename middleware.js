import { NextResponse } from "next/server";
import cookie from "cookie";

export async function middleware(req) {
  let isAuthenticated = false;
  try {
    if (!req.headers.get("cookie")) {
      throw new Error("No cookie header");
    }
    const response = await fetch(`${req.nextUrl.origin}/api/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: cookie.parse(req.headers.get("cookie")).authToken,
      }),
    });
    isAuthenticated = response.ok;
  } catch (error) {
    console.error("Error during authentication:", error);
  }

  const url = req.nextUrl.clone();

  if (!isAuthenticated && url.pathname === "/timeline") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users from protected pages to the login page
  if (!isAuthenticated && !url.pathname === "/login") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from the login page
  if (isAuthenticated && url.pathname === "/login") {
    url.pathname = "/timeline";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from the root page
  if (isAuthenticated && url.pathname === "/") {
    url.pathname = "/timeline";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from the root page
  if (!isAuthenticated && url.pathname === "/") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
