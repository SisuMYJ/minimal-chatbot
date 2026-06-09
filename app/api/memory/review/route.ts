import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embed } from "@/lib/embedding";

// GET  /api/memory/review            → 列出所有待审(pending)记忆
// POST /api/memory/review { id, action: 'approve'|'reject', content? }
//   approve: 通过 → 向量化 + 标记 confirmed（可顺带改 content）
//   reject : 删除这条待审记忆

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("memories")
    .select("id, content, source, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, pending: data });
}

export async function POST(req: Request) {
  try {
    const { id, action, content } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ ok: false, error: "缺少 id 或 action" }, { status: 400 });
    }

    if (action === "reject") {
      const { error } = await supabaseAdmin.from("memories").delete().eq("id", id);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, message: "已删除该待审记忆。" });
    }

    if (action === "approve") {
      // 通过时才向量化（可顺带用编辑后的 content）
      const { data: row, error: getErr } = await supabaseAdmin
        .from("memories")
        .select("content")
        .eq("id", id)
        .single();
      if (getErr) return NextResponse.json({ ok: false, error: getErr.message }, { status: 500 });

      const finalContent = (typeof content === "string" && content.trim()) ? content : row.content;
      const vector = await embed(finalContent);

      const { error: updErr } = await supabaseAdmin
        .from("memories")
        .update({
          content: finalContent,
          embedding: JSON.stringify(vector),
          status: "confirmed",
        })
        .eq("id", id);
      if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

      return NextResponse.json({ ok: true, message: "已通过并入库（已向量化）。" });
    }

    return NextResponse.json({ ok: false, error: "action 必须是 approve 或 reject" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
