import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}