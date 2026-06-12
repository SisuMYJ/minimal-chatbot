import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "没有文件" }, { status: 400 });

    const ext = file.name.split(".").pop() || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("uploads")
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const { data } = supabaseAdmin.storage.from("uploads").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl, type: file.type, name: file.name });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
