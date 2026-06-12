import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST   收藏一句话进寄语池 {content}
// GET    取寄语（pinned优先，否则随机一条）
// PATCH  固定/取消固定 {id, pinned}  | DELETE ?id=
export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ ok: false, error: "缺少内容" }, { status: 400 });
    const { error } = await supabaseAdmin.from("blessings").insert({ content });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  // 有固定的就返回固定的
  const { data: pinnedRows } = await supabaseAdmin
    .from("blessings").select("*").eq("pinned", true).limit(1);
  if (pinnedRows && pinnedRows.length > 0) {
    return NextResponse.json({ ok: true, blessing: pinnedRows[0], all: null });
  }
  // 否则取全部，前端随机
  const { data, error } = await supabaseAdmin
    .from("blessings").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, blessing: null, all: data });
}

export async function PATCH(req: Request) {
  const { id, pinned } = await req.json();
  if (id === undefined) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
  // 先全部取消固定，再固定这一条（保证只有一条固定）
  if (pinned) await supabaseAdmin.from("blessings").update({ pinned: false }).neq("id", -1);
  const { error } = await supabaseAdmin.from("blessings").update({ pinned: !!pinned }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("blessings").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
