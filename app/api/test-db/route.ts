import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 测试接口：部署后浏览器访问 /api/test-db
// 它会往 memories 表写一条，再把最近 5 条读出来返回。
export async function GET() {
  try {
    // 1) 写一条测试记忆
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("memories")
      .insert({
        content: `来自 app 的测试写入 · ${new Date().toISOString()}`,
        source: "manual",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { step: "insert", ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    // 2) 读最近 5 条
    const { data: rows, error: selectError } = await supabaseAdmin
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (selectError) {
      return NextResponse.json(
        { step: "select", ok: false, error: selectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "app ↔ Supabase 连接成功，已写入并读出。",
      justInserted: inserted,
      latest5: rows,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}
