import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { count, error } = await supabaseAdmin
    .from("memories")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: count ?? 0 });
}
