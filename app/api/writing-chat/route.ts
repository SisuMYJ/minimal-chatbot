import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 60;

// 改稿专用对话：注入 总prompt + style + 写作区专享prompt + 基本信息 + 待呼应伏笔
// 每个模型独立调用（前端按窗分别请求），互不影响。
export async function POST(req: Request) {
  try {
    const { messages, model, workId } = await req.json();

    if (!model || !workId) {
      return new Response(JSON.stringify({ error: "缺少 model 或 workId" }), { status: 400 });
    }

    // 读设置：总prompt、style、写作区专享prompt
    const { data: settingsRows } = await supabaseAdmin
      .from("settings")
      .select("key, value")
      .in("key", ["prompt", "style", "writing_prompt"]);
    const settings: Record<string, string> = {};
    (settingsRows || []).forEach((r) => (settings[r.key] = r.value));

    // 读这部作品的基本信息
    const { data: work } = await supabaseAdmin
      .from("works")
      .select("title, info")
      .eq("id", workId)
      .maybeSingle();

    // 读待呼应的伏笔
    const { data: tracks } = await supabaseAdmin
      .from("tracks")
      .select("content, kind")
      .eq("work_id", workId)
      .eq("status", "open")
      .order("created_at", { ascending: true });

    const foreshadowText =
      tracks && tracks.length > 0
        ? tracks.map((t) => `- ${t.content}`).join("\n")
        : "（暂无待呼应的伏笔）";

    // 组装注入
    const systemParts = [
      settings.prompt ? `【你是谁】\n${settings.prompt}` : "",
      settings.style ? `【你怎么说话】\n${settings.style}` : "",
      settings.writing_prompt
        ? `【改稿沟通原则】\n${settings.writing_prompt}`
        : "",
      `【当前作品】《${work?.title || "未命名"}》`,
      work?.info ? `【基本信息·人设/梗概/世界观】\n${work.info}` : "",
      `【待呼应的伏笔】\n${foreshadowText}`,
      `【任务】你是我的编辑。请基于以上设定，对我发来的章节给出改稿意见。严格遵守上面的改稿沟通原则。如果我提到某处呼应前文/后文，你可以要求我提供那部分，或基于我给的信息检查合理性。`,
    ].filter(Boolean);

    const systemPrompt = systemParts.join("\n\n");

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // 流式调用 OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
        model,
        messages: fullMessages,
        stream: true,
        max_tokens: 16384,
      }),

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), { status: 500 });
    }

    // 直接把流转发给前端
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
