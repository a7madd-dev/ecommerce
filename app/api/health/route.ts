import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Lightweight liveness + DB-readiness probe used by the Docker/Traefik
// healthchecks. Returns 503 when Postgres is unreachable so the proxy stops
// routing traffic to a broken container.
export async function GET() {
  try {
    const { error } = await getServiceClient()
      .from("categories")
      .select("id", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ status: "ok", db: "up" });
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: "down", message: (err as Error).message },
      { status: 503 }
    );
  }
}
