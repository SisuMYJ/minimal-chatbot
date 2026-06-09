import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embed } from "@/lib/embedding";

// 临时验证检索。访问 /api/memory/test-search?q=布丁
// 验证完删掉本文件。
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "布丁";

    const queryVector = await embed(query);
    const { data, error } = await supabaseAdmin.rpc("match_memories", {
      query_embedding: JSON.stringify(queryVector),
      match_count: 5,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, query, results: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
