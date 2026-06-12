import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET    /api/sessions            → 列出所有会话（含 folder）
// POST   /api/sessions {id,title} → 新建会话
// PATCH  /api/sessions {id, title?, folder?} → 改标题 和/或 改文件夹
// DELETE /api/sessions?id=xxx     → 删除会话及其消息

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("id, title, folder, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, sessions: data });
}

export async function POST(req: Request) {
  try {
    const { id, title } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });
    const { error } = await supabaseAdmin
      .from("sessions")
      .insert({ id, title: title || "新对话" })
      .select()
      .single();
    if (error && error.code !== "23505") {
      // 23505 = 已存在，忽略
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, title, folder } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof title === "string") patch.title = title;
    // folder 允许设为 null（移出文件夹）
    if (folder !== undefined) patch.folder = folder;

    const { error } = await supabaseAdmin.from("sessions").update(patch).eq("id", id);
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
    // 先删消息，再删会话
    await supabaseAdmin.from("messages").delete().eq("session_id", id);
    const { error } = await supabaseAdmin.from("sessions").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
