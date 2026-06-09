import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embed } from "@/lib/embedding";

// 临时验证接口：跑通"向量化+存入"这根管子。验证完删掉本文件。
// 浏览器访问 /api/memory/test-flow 即可。
export async function GET() {
  try {
    const content = `测试向量化 · 布丁今天又趴在我键盘上不让我打字 · ${new Date().toISOString()}`;

    // 1) 向量化
    const vector = await embed(content);

    // 2) 存入
    const { data, error } = await supabaseAdmin
      .from("memories")
      .insert({
        content,
        source: "manual",
        status: "confirmed",
        embedding: JSON.stringify(vector),
      })
      .select("id, content, source, status, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, step: "insert", error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "向量化+存入 跑通了。",
      saved: data,
      vectorDim: vector.length,        // 该是 1536
      vectorPreview: vector.slice(0, 5), // 看前5个数，确认是真向量不是空的
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
