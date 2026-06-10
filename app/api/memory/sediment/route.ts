import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 沉淀：只处理"上次沉淀之后"的新对话，按"完整意思"切成精炼记忆，提名进待审区。
const SEDIMENT_MODEL = "deepseek/deepseek-v4-flash";
const GAP_HOURS = 4;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string | null = body.sessionId ?? null;
    const force: boolean = body.force ?? false;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "缺少 sessionId" }, { status: 400 });
    }

    // 读这个会话上次沉淀到哪了
    const { data: sessionRow } = await supabaseAdmin
      .from("sessions")
      .select("last_sediment_at")
      .eq("id", sessionId)
      .maybeSingle();
    const lastSedimentAt = sessionRow?.last_sediment_at ?? null;

    // 取"上次沉淀之后"的新消息（没沉淀过的）
    let q = supabaseAdmin
      .from("messages")
      .select("role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (lastSedimentAt) {
      q = q.gt("created_at", lastSedimentAt);
    }
    const { data: newMsgs, error: msgErr } = await q;

    if (msgErr) {
      return NextResponse.json({ ok: false, step: "fetch_messages", error: msgErr.message }, { status: 500 });
    }
    if (!newMsgs || newMsgs.length === 0) {
      return NextResponse.json({ ok: true, message: "没有新内容需要沉淀。", nominated: [] });
    }

    // 跨段判断：最新一条距现在是否超过4小时（force 时跳过）
    const latestTime = new Date(newMsgs[newMsgs.length - 1].created_at).getTime();
    const hoursSince = (Date.now() - latestTime) / (1000 * 60 * 60);
    if (!force && hoursSince < GAP_HOURS) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: `距上次对话仅 ${hoursSince.toFixed(1)} 小时，未达 ${GAP_HOURS} 小时阈值，不沉淀。`,
        nominated: [],
      });
    }

    // 整理成文本喂给便宜模型
    const transcript = newMsgs
      .map((m) => `[${m.role}] ${m.content}`)
      .join("\n");

    const sedimentPrompt = `下面是一段对话记录。请你从中提炼出"值得长期记住的记忆点"。
要求：
1. 按"一个完整的意思"切分，一条记忆只承载一个完整的点。
2. 每条控制在 1-2 句话，简洁有焦点，像日记里的一句心声，不要写成一大段叙述、不要堆砌细节。
3. 用第一人称、带恰当的情感色彩书写（站在"我"的角度），但情感是点到为止的温度，不是冗长的抒情。
4. 只记真正有长期价值的：事实、偏好、情绪、关系、重要决定、独特观点。跳过寒暄、临时性的、无记忆价值的内容。
5. 如果这段对话没有值得记的，返回空数组。
6. 严格只返回 JSON 数组，形如 ["记忆1","记忆2"]，不要任何额外解释、不要 markdown 代码块。

对话记录：
${transcript}`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SEDIMENT_MODEL,
        messages: [{ role: "user", content: sedimentPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return NextResponse.json({ ok: false, step: "ai_sediment", error: t }, { status: 500 });
    }

    const aiData = await aiRes.json();
    let raw = aiData?.choices?.[0]?.message?.content ?? "[]";
    raw = raw.replace(/```json|```/g, "").trim();

    let memories: string[] = [];
    try {
      memories = JSON.parse(raw);
      if (!Array.isArray(memories)) memories = [];
    } catch {
      return NextResponse.json({ ok: false, step: "parse", error: "模型返回不是合法JSON", raw }, { status: 500 });
    }

    // 不管有没有提炼出记忆，都推进"沉淀进度"到最新消息时间——
    // 这样已经看过的这批消息，下次不会再被沉淀（防重复的关键）
    const newWatermark = newMsgs[newMsgs.length - 1].created_at;
    await supabaseAdmin
      .from("sessions")
      .update({ last_sediment_at: newWatermark })
      .eq("id", sessionId);

    if (memories.length === 0) {
      return NextResponse.json({ ok: true, message: "这段新对话没有值得沉淀的记忆点。", nominated: [] });
    }

    // 提名进待审区
    const rows = memories.map((content) => ({
      content,
      source: "ai",
      status: "pending",
    }));
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("memories")
      .insert(rows)
      .select("id, content, status");

    if (insErr) {
      return NextResponse.json({ ok: false, step: "insert_pending", error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `沉淀完成，提名了 ${inserted.length} 条记忆进待审区。`,
      nominated: inserted,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
