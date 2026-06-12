import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET    /api/works           → 列出所有作品（正文+灵感）
// POST   /api/works {title, kind?} → 新建作品/灵感
// PATCH  /api/works {id, title?, kind?, info?} → 改标题/转正(kind)/改基本信息
// DELETE /api/works?id=xxx     → 删除作品（连带章节、追踪）

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("works")
    .select("id, title, kind, info, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, works: data });
}

export async function POST(req: Request) {
  try {
    const { title, kind } = await req.json();
    if (!title) return NextResponse.json({ ok: false, error: "缺少 title" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("works")
      .insert({ title, kind: kind || "idea" })
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, work: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, title, kind, info } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof title === "string") patch.title = title;
    if (typeof kind === "string") patch.kind = kind;
    if (typeof info === "string") patch.info = info;
    const { error } = await supabaseAdmin.from("works").update(patch).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
    const { error } = await supabaseAdmin.from("works").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
