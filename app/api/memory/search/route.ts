import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embed } from "@/lib/embedding";

// 检索：给一句话 → 向量化 → 从库里按相似度捞最相关的记忆。
// 入参 JSON: { query: string, count?: number }
export async function POST(req: Request) {
  try {
    const { query, count = 5 } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "缺少 query" }, { status: 400 });
    }

    // 1) 把查询句向量化
    const queryVector = await embed(query);

    // 2) 调数据库的向量检索函数
    const { data, error } = await supabaseAdmin.rpc("match_memories", {
      query_embedding: JSON.stringify(queryVector),
      match_count: count,
    });

    if (error) {
      return NextResponse.json({ ok: false, step: "match", error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, query, results: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
