import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 按关键词搜聊天消息，返回命中的消息+所属会话
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kw = searchParams.get("kw");
  if (!kw || !kw.trim()) return NextResponse.json({ ok: false, error: "缺少关键词" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("id, session_id, role, content, created_at")
    .ilike("content", `%${kw}%`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // 取这些消息所属会话的标题
  const sessionIds = Array.from(new Set((data || []).map((m) => m.session_id)));
  const titles: Record<string, string> = {};
  if (sessionIds.length > 0) {
    const { data: sess } = await supabaseAdmin
      .from("sessions")
      .select("id, title")
      .in("id", sessionIds);
    (sess || []).forEach((s) => (titles[s.id] = s.title));
  }

  const hits = (data || []).map((m) => {
    const idx = m.content.indexOf(kw);
    const start = Math.max(0, idx - 60);
    const end = Math.min(m.content.length, idx + kw.length + 60);
    const snippet = (start > 0 ? "…" : "") + m.content.slice(start, end) + (end < m.content.length ? "…" : "");
    return {
      session_id: m.session_id,
      session_title: titles[m.session_id] || "对话",
      role: m.role,
      snippet,
      created_at: m.created_at,
    };
  });

  return NextResponse.json({ ok: true, hits });
}
