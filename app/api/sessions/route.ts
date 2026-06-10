import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET  /api/sessions          → 列出所有会话（最近更新的在前）
// POST /api/sessions          → 新建会话 { id, title? }
// PATCH /api/sessions         → 重命名 { id, title }
// DELETE /api/sessions?id=xxx → 删除会话及其消息

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, sessions: data });
}

export async function POST(req: Request) {
  try {
    const { id, title } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "缺少 id" }, { status: 400 });

    // 默认标题用编号逻辑：数一下现有会话数 +1
    let finalTitle = title;
    if (!finalTitle) {
      const { count } = await supabaseAdmin
        .from("sessions")
        .select("id", { count: "exact", head: true });
      finalTitle = `对话 ${(count ?? 0) + 1}`;
    }

    const { data, error } = await supabaseAdmin
      .from("sessions")
      .insert({ id, title: finalTitle })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, session: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, title } = await req.json();
    if (!id || typeof title !== "string") {
      return NextResponse.json({ ok: false, error: "缺少 id 或 title" }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from("sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id);

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

    // 先删该会话的消息，再删会话本身
    await supabaseAdmin.from("messages").delete().eq("session_id", id);
    const { error } = await supabaseAdmin.from("sessions").delete().eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
