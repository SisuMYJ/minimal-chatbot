import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 在某作品的已定稿章节里，按关键词搜片段
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workId = searchParams.get("work_id");
  const kw = searchParams.get("kw");
  if (!workId || !kw) return NextResponse.json({ ok: false, error: "缺少参数" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("chapters")
    .select("chapter_no, title, content")
    .eq("work_id", workId)
    .eq("status", "final")
    .ilike("content", `%${kw}%`)
    .order("chapter_no", { ascending: true });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // 截取每个匹配章节里含关键词的上下文片段（前后各120字）
  const hits = (data || []).map((ch) => {
    const idx = ch.content.indexOf(kw);
    const start = Math.max(0, idx - 120);
    const end = Math.min(ch.content.length, idx + kw.length + 120);
    const snippet = (start > 0 ? "…" : "") + ch.content.slice(start, end) + (end < ch.content.length ? "…" : "");
    return { chapter_no: ch.chapter_no, title: ch.title, snippet };
  });

  return NextResponse.json({ ok: true, hits });
}
