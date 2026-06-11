import { NextResponse } from "next/server";

// 查 OpenRouter 账户余额
export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/credits", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: t }, { status: 500 });
    }
    const data = await res.json();
    // OpenRouter 返回 { data: { total_credits, total_usage } }
    const total = data?.data?.total_credits ?? 0;
    const used = data?.data?.total_usage ?? 0;
    return NextResponse.json({
      ok: true,
      total,
      used,
      remaining: total - used,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
