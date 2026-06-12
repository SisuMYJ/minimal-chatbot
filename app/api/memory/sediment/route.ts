import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 沉淀：只处理"上次沉淀之后"的新对话，按"完整意思"切成精炼记忆，提名进待审区。
// 记忆带"对话原时间"，时间也写进记忆内容，视角钉死为"我（阿竫）"。
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

    // 取"上次沉淀之后"的新消息
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

    // 跨段判断（force 跳过）
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

    // 整理文本：标清"我（阿竫）"和"AI"，避免视角搞反
    const transcript = newMsgs
      .map((m) => `${m.role === "user" ? "我（阿竫）" : "AI"}：${m.content}`)
      .join("\n");

    // 这段对话发生的时间范围（上海时区），喂给模型，让它把时间写进记忆
    const convoStart = new Date(newMsgs[0].created_at).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
    const convoEnd = new Date(newMsgs[newMsgs.length - 1].created_at).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
    const convoTimeLabel = convoStart === convoEnd ? convoStart : `${convoStart} 到 ${convoEnd}`;

    const sedimentPrompt = `下面是"我（阿竫）"和"AI"的一段对话记录。请你站在"我（阿竫）"的角度，提炼出"我"值得长期记住的记忆点。

重要：对话里标注"我（阿竫）"的才是我本人，标注"AI"的是我的AI伙伴。所有记忆都要从"我（阿竫）"的第一人称视角书写——记的是关于我的事实、我的情绪、我的偏好、我和AI的关系。绝不要把AI说的话当成我说的，也不要把视角搞反。

要求：
1. 按"一个完整的意思"切分，一条记忆只承载一个完整的点。
2. 每条控制在 1-2 句话，简洁有焦点，像日记里的一句心声，不要写成一大段叙述、不要堆砌细节。
3. 用第一人称（"我"=阿竫）、带恰当的情感色彩书写，但情感是点到为止的温度，不是冗长的抒情。
4. 如果某条记忆涉及具体时间（哪一年、哪个时期发生的），把时间自然写进记忆内容里。这段对话发生在【${convoTimeLabel}】，需要时以此为准（例如写"我在2024年养了布丁"，而不是只说"我养了布丁"）。
5. 只记真正有长期价值的：事实、偏好、情绪、关系、重要决定、独特观点。跳过寒暄、临时性的、无记忆价值的内容。
6. 如果这段对话没有值得记的，返回空数组。
7. 严格只返回 JSON 数组，形如 ["记忆1","记忆2"]，不要任何额外解释、不要 markdown 代码块。

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
      // 容错：模型偶尔在 JSON 前后裹了多余的话，抠出 [...] 再解析
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          memories = JSON.parse(match[0]);
          if (!Array.isArray(memories)) memories = [];
        } catch {
          memories = [];
        }
      } else {
        memories = [];
      }
    }

    // 推进沉淀水位线（不管有没有提炼出，都推进，防重复）
    const newWatermark = newMsgs[newMsgs.length - 1].created_at;
    await supabaseAdmin
      .from("sessions")
      .update({ last_sediment_at: newWatermark })
      .eq("id", sessionId);

    if (memories.length === 0) {
      return NextResponse.json({ ok: true, message: "这段新对话没有值得沉淀的记忆点。", nominated: [] });
    }

    // 提名进待审区：记忆的 created_at 用「对话原时间」，不是沉淀此刻
    const convoTime = newMsgs[newMsgs.length - 1].created_at;
    const rows = memories.map((content) => ({
      content,
      source: "ai",
      status: "pending",
      created_at: convoTime,
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
