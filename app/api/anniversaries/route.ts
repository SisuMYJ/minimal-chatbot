import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("anniversaries").select("*").order("month").order("day");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, anniversaries: data });
}

export async function POST(req: Request) {
  try {
    const { name, month, day, is_lunar } = await req.json();
    if (!name || !month || !day) return NextResponse.json({ ok: false, error: "缺少字段" }, { status: 400 });
    const { error } = await supabaseAdmin.from("anniversaries").insert({ name, month, day, is_lunar: !!is_lunar });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("anniversaries").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
