import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTodayInfo } from "@/lib/festivals";
import { Solar } from "lunar-javascript";

export async function GET() {
  const now = new Date();
  // 上海时区的今天
  const sh = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const m = sh.getMonth() + 1;
  const d = sh.getDate();

  // 今天的节日/节气
  const todayInfo = getTodayInfo(sh);

  // 私人纪念日（必显示）——匹配今天月日
  const { data: annivs } = await supabaseAdmin.from("anniversaries").select("*");
  const todayAnnivs: string[] = [];
  (annivs || []).forEach((a) => {
    if (a.is_lunar) {
      // 农历纪念日：把今天转农历比对
      const lunar = Solar.fromDate(sh).getLunar();
      if (lunar.getMonth() === a.month && lunar.getDay() === a.day) todayAnnivs.push(a.name);
    } else {
      if (a.month === m && a.day === d) todayAnnivs.push(a.name);
    }
  });

  // 提醒：今天的 + 过期未完成的
  const { data: reminders } = await supabaseAdmin
    .from("reminders").select("*").eq("done", false).order("remind_at", { ascending: true });
  const todayReminders = (reminders || []).filter((r) => {
    if (r.notify_mode === "always") return true;
    if (!r.remind_at) return r.notify_mode === "always";
    const rt = new Date(r.remind_at);
    const rtSh = new Date(rt.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    const diffDays = Math.floor((rtSh.getTime() - sh.setHours(0, 0, 0, 0)) / 86400000);
    if (r.notify_mode === "before") return diffDays <= (r.before_days || 0) && diffDays >= -3650;
    // onday：今天或已过期
    return diffDays <= 0;
  });

  // 寄语
  const { data: pinnedB } = await supabaseAdmin.from("blessings").select("*").eq("pinned", true).limit(1);
  let blessing = null;
  let allBlessings = null;
  if (pinnedB && pinnedB.length > 0) {
    blessing = pinnedB[0];
  } else {
    const { data: all } = await supabaseAdmin.from("blessings").select("*");
    allBlessings = all || [];
  }

  return NextResponse.json({
    ok: true,
    today: todayInfo,
    anniversaries: todayAnnivs,
    reminders: todayReminders.map((r) => ({ id: r.id, content: r.content, remind_at: r.remind_at })),
    blessing,
    allBlessings,
  });
}
