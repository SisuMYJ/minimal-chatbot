import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CLAUDE = "anthropic/claude-opus-4.8";

// 定稿时调用：Claude 读这章，抽取新伏笔/设定/人物变化，写进 tracks
export async function POST(req: Request) {
  try {
    const { workId, chapterNo, content } = await req.json();
    if (!workId || !content) {
      return NextResponse.json({ ok: false, error: "缺少参数" }, { status: 400 });
    }

    const prompt = `下面是小说《某作品》第${chapterNo ?? "?"}章的定稿正文。请你以"帮作者记账"的角度，抽取这一章里值得追踪的要点，分三类：
- foreshadow（伏笔）：这章埋下的、以后要呼应的线索
- character（人物状态）：人物的情绪/性格/关系发生的变化
- setting（设定）：新出现的世界观/规则/重要设定

要求：
1. 只记真正值得长期追踪的，宁缺毋滥，不要把普通描写当伏笔。
2. 每条简洁一句话，注明"第${chapterNo ?? "?"}章"。
3. 严格只返回 JSON 数组，每项形如 {"kind":"foreshadow","content":"第3章：埋了他怕水，待呼应"}。没有就返回 []。不要任何额外解释、不要markdown。

正文：
${content}`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: CLAUDE, messages: [{ role: "user", content: prompt }] }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return NextResponse.json({ ok: false, error: t }, { status: 500 });
    }
    const aiData = await aiRes.json();
    let raw = aiData?.choices?.[0]?.message?.content ?? "[]";
    raw = raw.replace(/```json|```/g, "").trim();

    let items: { kind: string; content: string }[] = [];
    try {
      items = JSON.parse(raw);
      if (!Array.isArray(items)) items = [];
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) { try { items = JSON.parse(m[0]); } catch { items = []; } }
    }

    if (items.length === 0) {
      return NextResponse.json({ ok: true, added: 0 });
    }

    const rows = items
      .filter((it) => it.content && it.kind)
      .map((it) => ({
        work_id: workId,
        kind: it.kind,
        content: it.content,
        source: "ai",
        status: "open",
        chapter_no: chapterNo ?? null,
      }));

    const { data, error } = await supabaseAdmin.from("tracks").insert(rows).select("id");
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, added: data.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
