import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("reminders")
    .select("*")
    .order("remind_at", { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reminders: data });
}

export async function POST(req: Request) {
  try {
    const { content, remind_at } = await req.json();
    if (!content) return NextResponse.json({ ok: false, error: "缺少内容" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("reminders")
      .insert({ content, remind_at: remind_at || null })
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, reminder: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  if (id === undefined) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("reminders").update({ done: !!done }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("reminders").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
