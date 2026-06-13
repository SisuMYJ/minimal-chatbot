'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type HomeData = {
  today: { festival: string | null; solarTerm: string | null; lunarFestival: string | null; lunarDate: string };
  anniversaries: string[];
  reminders: { id: number; content: string; remind_at: string | null }[];
  blessing: { id: number; content: string; pinned: boolean } | null;
  allBlessings: { id: number; content: string; pinned: boolean }[] | null;
};

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [blessing, setBlessing] = useState<{ id: number; content: string; pinned: boolean } | null>(null);
  const [weather, setWeather] = useState<string>('');

  const pickRandom = (list: { id: number; content: string; pinned: boolean }[]) =>
    list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;

  useEffect(() => {
    fetch('/api/home').then((r) => r.json()).then((d: HomeData & { ok: boolean }) => {
      if (d.ok) {
        setData(d);
        if (d.blessing) setBlessing(d.blessing);
        else if (d.allBlessings) setBlessing(pickRandom(d.allBlessings));
      }
    });
    // 天气
    fetch('https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current=temperature_2m,weather_code&timezone=Asia/Shanghai')
      .then((r) => r.json())
      .then((w) => {
        const t = w?.current?.temperature_2m;
        if (t !== undefined) setWeather(`上海 ${Math.round(t)}°C`);
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const sh = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const hour = sh.getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : hour < 23 ? '晚上好' : '夜深了';
  const dateStr = `${sh.getMonth() + 1}月${sh.getDate()}日`;

  const shuffle = () => {
    if (data?.allBlessings && data.allBlessings.length > 0) setBlessing(pickRandom(data.allBlessings));
  };

  const togglePin = async () => {
    if (!blessing) return;
    const np = !blessing.pinned;
    await fetch('/api/favorite-message', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blessing.id, pinned: np }),
    });
    setBlessing({ ...blessing, pinned: np });
  };

  // 今天的特别：纪念日优先 > 农历节日 > 公历节日 > 节气 > 农历日期兜底
  const special: string[] = [];
  if (data) {
    data.anniversaries.forEach((a) => special.push(`· ${a}`));
    if (data.today.lunarFestival) special.push(data.today.lunarFestival);
    if (data.today.festival) special.push(data.today.festival);
    if (data.today.solarTerm) special.push(data.today.solarTerm);
    if (special.length === 0) special.push(`农历${data.today.lunarDate}`);
  }

  return (
    <div
      className="relative flex flex-col h-dvh overflow-y-auto"
      style={{ background: 'linear-gradient(to bottom, hsl(226 60% 96%), hsl(40 33% 98%) 45%)' }}
    >
      {/* 淡淡星月点缀 */}
      <div className="pointer-events-none absolute top-10 right-10 text-primary/15 text-4xl select-none">✦</div>
      <div className="pointer-events-none absolute top-24 right-24 text-primary/10 text-2xl select-none">✦</div>
      <div className="pointer-events-none absolute bottom-20 left-12 text-primary/10 text-3xl select-none">☾</div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-10 max-w-xl mx-auto w-full">
        {/* 问候 + 时间天气 */}
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-2xl font-medium text-foreground">{greeting}，阿竫</h1>
          <p className="text-sm text-muted-foreground">
            {dateStr}{weather && ` · ${weather}`}
          </p>
        </div>

        {/* 今天的特别 */}
        {special.length > 0 && (
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs text-primary/60 tracking-widest">今 天</span>
            {special.map((s, i) => (
              <span key={i} className="text-sm text-foreground/80">{s}</span>
            ))}
          </div>
        )}

        {/* 寄语（主角，最大） */}
        <div className="flex flex-col items-center gap-4 py-6">
          {blessing ? (
            <>
              <p className="text-xl md:text-2xl leading-relaxed text-center text-foreground whitespace-pre-wrap font-light">
                {blessing.content}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                {!blessing.pinned && data?.allBlessings && data.allBlessings.length > 1 && (
                  <button onClick={shuffle} className="hover:text-primary">换一句</button>
                )}
                <button onClick={togglePin} className="hover:text-primary">
                  {blessing.pinned ? '取消固定' : '固定这句'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center">收藏喜欢的话，这里会给你一句。</p>
          )}
        </div>

        {/* 今日提醒 */}
        {data && data.reminders.length > 0 && (
          <div className="w-full max-w-sm flex flex-col gap-2">
            <span className="text-xs text-primary/60 tracking-widest text-center">待 办</span>
            {data.reminders.map((r) => (
              <div
                key={r.id}
                className="rounded-xl bg-card/60 border border-border px-4 py-2 text-sm text-foreground/90 flex justify-between items-center"
              >
                <span>{r.content}</span>
                {r.remind_at && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {new Date(r.remind_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
            <button onClick={() => router.push('/reminders')} className="text-xs text-muted-foreground hover:text-primary self-center mt-1">
              查看全部
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
