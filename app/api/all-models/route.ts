import { NextResponse } from "next/server";

// 拉取 OpenRouter 所有可用模型
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
    // 精简：只返回 id、名字、是否支持图片
    const models = (data?.data || []).map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      vision: m.architecture?.input_modalities?.includes("image") ?? false,
    }));
    return NextResponse.json({ ok: true, models });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
