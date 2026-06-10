import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 沉淀：回看最近一段对话，按"完整意思"切成多条记忆，提名进待审区(status=pending)。
// 设计：用便宜模型(deepseek)做切分提炼，省 token。
// 触发：前端在"检测到距上次对话超过4小时"或"用户手动点沉淀"时调用本接口。
const SEDIMENT_MODEL = "deepseek/deepseek-v4-flash"; // 便宜模型做沉淀，省钱
const GAP_HOURS = 4; // 跨段阈值：超过这么久没新对话，视为上一段结束

export async function POST(req: Request) {
  try {
    // 入参：{ sessionId?: string, force?: boolean }
    // force=true 表示手动立即沉淀，跳过4小时判断
    const body = await req.json().catch(() => ({}));
    const sessionId: string | null = body.sessionId ?? null;
    const force: boolean = body.force ?? false;

    // 1) 取这个会话最近的对话原文（最多取最近 40 条，够沉淀一段了）
    let q = supabaseAdmin
      .from("messages")
      .select("role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(40);
    if (sessionId) q = q.eq("session_id", sessionId);

    const { data: recent, error: msgErr } = await q;
    if (msgErr) {
      return NextResponse.json({ ok: false, step: "fetch_messages", error: msgErr.message }, { status: 500 });
    }
    if (!recent || recent.length === 0) {
      return NextResponse.json({ ok: true, message: "没有可沉淀的对话。", nominated: [] });
    }

    // 2) 跨段判断：最近一条消息距现在是否超过4小时（force 时跳过）
    const lastTime = new Date(recent[0].created_at).getTime();
    const hoursSince = (Date.now() - lastTime) / (1000 * 60 * 60);
    if (!force && hoursSince < GAP_HOURS) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: `距上次对话仅 ${hoursSince.toFixed(1)} 小时，未达 ${GAP_HOURS} 小时阈值，不沉淀。`,
        nominated: [],
      });
    }

    // 3) 把对话整理成时间正序文本，喂给便宜模型做切分
    const ordered = [...recent].reverse();
    const transcript = ordered
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
    // 去掉可能的 ```json 包裹
    raw = raw.replace(/```json|```/g, "").trim();

    let memories: string[] = [];
    try {
      memories = JSON.parse(raw);
      if (!Array.isArray(memories)) memories = [];
    } catch {
      return NextResponse.json({ ok: false, step: "parse", error: "模型返回不是合法JSON", raw }, { status: 500 });
    }

    if (memories.length === 0) {
      return NextResponse.json({ ok: true, message: "这段对话没有值得沉淀的记忆点。", nominated: [] });
    }

    // 4) 提名进待审区：status=pending、source=ai，先不向量化（等你 Review 通过后再向量化存入）
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
      message: `沉淀完成，提名了 ${inserted.length} 条记忆进待审区，等你 Review。`,
      nominated: inserted,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
