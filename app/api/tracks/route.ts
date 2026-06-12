import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET    /api/tracks?work_id=xxx&status=open  → 列某作品的追踪项（可按status筛）
// POST   /api/tracks {work_id, kind?, content, source?, chapter_no?} → 新建追踪
// PATCH  /api/tracks {id, content?, status?, kind?} → 改/标记了结
// DELETE /api/tracks?id=xxx

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workId = searchParams.get("work_id");
  const status = searchParams.get("status");
  if (!workId) return NextResponse.json({ ok: false, error: "缺少 work_id" }, { status: 400 });

  let q = supabaseAdmin
    .from("tracks")
    .select("*")
    .eq("work_id", workId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, tracks: data });
}

export async function POST(req: Request) {
  try {
    const { work_id, kind, content, source, chapter_no } = await req.json();
    if (!work_id || !content) return NextResponse.json({ ok: false, error: "缺少 work_id 或 content" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("tracks")
      .insert({
        work_id,
        kind: kind || "foreshadow",
        content,
        source: source || "manual",
        chapter_no: chapter_no ?? null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, track: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, content, status, kind } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof content === "string") patch.content = content;
    if (typeof status === "string") patch.status = status; // 'open' / 'closed'
    if (typeof kind === "string") patch.kind = kind;
    const { error } = await supabaseAdmin.from("tracks").update(patch).eq("id", id);
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
    const { error } = await supabaseAdmin.from("tracks").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
