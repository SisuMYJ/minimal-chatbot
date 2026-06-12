import { NextResponse } from "next/server";

// 拉取 OpenRouter 所有可用模型（含价格）
export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: t }, { status: 500 });
    }
    const data = await res.json();
    const models = (data?.data || []).map((m: any) => {
      // OpenRouter 价格单位是「每 token 美元」，换算成「每百万 token 美元」更直观
      const promptPrice = m.pricing?.prompt ? Number(m.pricing.prompt) * 1_000_000 : null;
      const completionPrice = m.pricing?.completion ? Number(m.pricing.completion) * 1_000_000 : null;
      return {
        id: m.id,
        name: m.name || m.id,
        vision: m.architecture?.input_modalities?.includes("image") ?? false,
        promptPrice,      // 每百万输入token 美元
        completionPrice,  // 每百万输出token 美元
      };
    });
    return NextResponse.json({ ok: true, models });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
