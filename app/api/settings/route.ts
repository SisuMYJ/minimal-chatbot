import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET  /api/settings        → 读出所有设置，返回成 { prompt, style, ... } 对象
// POST /api/settings        → 保存 { key, value }（一次存一项）

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // 把 [{key,value},...] 转成 {key: value, ...} 方便前端用
  const settings: Record<string, string> = {};
  (data ?? []).forEach((row) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json({ ok: true, settings });
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key || typeof value !== "string") {
      return NextResponse.json({ ok: false, error: "缺少 key 或 value" }, { status: 400 });
    }

    // upsert：有就更新，没有就插入
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
