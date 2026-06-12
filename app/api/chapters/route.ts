import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET    /api/chapters?work_id=xxx       → 列出某作品的所有章节
// GET    /api/chapters?id=xxx            → 取单章全文
// POST   /api/chapters {work_id, chapter_no?, title?, content?} → 新建章节
// PATCH  /api/chapters {id, title?, content?, chapter_no?, status?} → 改章节/定稿
// DELETE /api/chapters?id=xxx            → 删章节

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const workId = searchParams.get("work_id");

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, chapter: data });
  }

  if (!workId) return NextResponse.json({ ok: false, error: "缺少 work_id" }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .select("id, work_id, chapter_no, title, status, created_at, updated_at")
    .eq("work_id", workId)
    .order("chapter_no", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, chapters: data });
}

export async function POST(req: Request) {
  try {
    const { work_id, chapter_no, title, content } = await req.json();
    if (!work_id) return NextResponse.json({ ok: false, error: "缺少 work_id" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("chapters")
      .insert({
        work_id,
        chapter_no: chapter_no ?? null,
        title: title || "",
        content: content || "",
      })
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, chapter: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, title, content, chapter_no, status } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof title === "string") patch.title = title;
    if (typeof content === "string") patch.content = content;
    if (typeof chapter_no === "number") patch.chapter_no = chapter_no;
    if (typeof status === "string") patch.status = status; // 'draft' / 'final'
    const { error } = await supabaseAdmin.from("chapters").update(patch).eq("id", id);
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
    const { error } = await supabaseAdmin.from("chapters").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
