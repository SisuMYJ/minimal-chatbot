import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CLAUDE = "anthropic/claude-opus-4.8";

export async function POST(req: Request) {
  try {
    const { workId, chapterNo, content } = await req.json();
    if (!workId || !content) {
      return NextResponse.json({ ok: false, error: "缺少参数" }, { status: 400 });
    }

    // 读现有基本信息（让Claude知道已有啥，只补新的）
    const { data: work } = await supabaseAdmin
      .from("works").select("info").eq("id", workId).maybeSingle();
    const existingInfo = work?.info || "（暂无）";

    const prompt = `下面是小说第${chapterNo ?? "?"}章的定稿正文。请你做两件事，帮作者记账：

【一、追踪要点】抽取这章值得追踪的：
- foreshadow（伏笔）：埋下的、以后要呼应的线索
- character（人物状态）：人物情绪/性格/关系的变化
- setting（设定）：这章新出现的世界观/规则

【二、基本信息补充】判断这章里有没有"应该补进作品基本设定底子"的固定设定（比如world观规则、人物的固定设定、金手指机制等）。注意：已有的基本信息如下，只补充【新的、还没记过的】，不要重复：
${existingInfo}

严格只返回这个JSON结构，不要任何额外解释、不要markdown：
{"tracks":[{"kind":"foreshadow","content":"第${chapterNo ?? "?"}章：xxx"}], "infoAdd":["新设定1","新设定2"]}
没有就给空数组。

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
    let raw = aiData?.choices?.[0]?.message?.content ?? "{}";
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed: { tracks?: { kind: string; content: string }[]; infoAdd?: string[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { parsed = {}; } }
    }

    const tracks = Array.isArray(parsed.tracks) ? parsed.tracks : [];
    const infoAdd = Array.isArray(parsed.infoAdd) ? parsed.infoAdd : [];

    // 写 tracks
    let addedTracks = 0;
    if (tracks.length > 0) {
      const rows = tracks
        .filter((it) => it.content && it.kind)
        .map((it) => ({
          work_id: workId, kind: it.kind, content: it.content,
          source: "ai", status: "open", chapter_no: chapterNo ?? null,
        }));
      const { data } = await supabaseAdmin.from("tracks").insert(rows).select("id");
      addedTracks = data?.length || 0;
    }

    // 追加 info
    let addedInfo = 0;
    if (infoAdd.length > 0) {
      const appendText = "\n\n" + infoAdd.map((s) => `· ${s}（第${chapterNo ?? "?"}章补充）`).join("\n");
      const newInfo = (work?.info || "") + appendText;
      await supabaseAdmin.from("works").update({ info: newInfo }).eq("id", workId);
      addedInfo = infoAdd.length;
    }

    return NextResponse.json({ ok: true, addedTracks, addedInfo });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
