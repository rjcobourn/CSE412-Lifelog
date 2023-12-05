import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );

  response.headers.set(
    "Set-Cookie",
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  );

  return response;
}
