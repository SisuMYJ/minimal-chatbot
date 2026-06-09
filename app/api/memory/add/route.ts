import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embed } from "@/lib/embedding";

// 存入一条记忆：文字 → 向量化 → 连文字带向量写进库。
// 入参 JSON: { content: string, source?: 'manual'|'ai', status?: 'confirmed'|'pending' }
export async function POST(req: Request) {
  try {
    const { content, source = "manual", status = "confirmed" } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ ok: false, error: "缺少 content" }, { status: 400 });
    }

    // 1) 向量化
    const vector = await embed(content);

    // 2) 存入（embedding 字段以 pgvector 接受的字符串格式写入）
    const { data, error } = await supabaseAdmin
      .from("memories")
      .insert({
        content,
        source,
        status,
        embedding: JSON.stringify(vector),
      })
      .select("id, content, source, status, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, step: "insert", error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "记忆已向量化并存入。",
      saved: data,
      vectorDim: vector.length, // 应该是 1536，用来验证向量真的生成了
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
