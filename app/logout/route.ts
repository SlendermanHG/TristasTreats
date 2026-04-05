import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearUserSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
