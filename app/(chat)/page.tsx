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

  const special: string[] = [];
  if (data) {
    data.anniversaries.forEach((a) => special.push(a));
    if (data.today.lunarFestival) special.push(data.today.lunarFestival);
    if (data.today.festival) special.push(data.today.festival);
    if (data.today.solarTerm) special.push(data.today.solarTerm);
    if (special.length === 0) special.push(`农历${data.today.lunarDate}`);
  }

  return (
    <div
      className="relative flex flex-col h-dvh overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, hsl(190 22% 98%), hsl(204 20% 96%) 42%, hsl(198 42% 96%))' }}
    >
      <div className="pointer-events-none absolute top-8 right-8 text-primary/20 text-3xl select-none">✦</div>
      <div className="pointer-events-none absolute top-20 right-20 text-[#67b8d6]/35 text-xl select-none">✦</div>

      <div className="flex-1 flex flex-col px-5 py-10 gap-5 max-w-md mx-auto w-full">
        {/* 问候 */}
        <div className="text-center flex flex-col gap-1 pt-4 pb-2">
          <h1 className="text-2xl font-semibold text-foreground">{greeting}，阿竫</h1>
          <p className="text-sm text-muted-foreground">
            {dateStr}{weather && ` · ${weather}`}
          </p>
        </div>

        {/* 今天 卡片 */}
        {special.length > 0 && (
          <div className="rounded-[1.7rem] bg-card/72 backdrop-blur border border-border/70 px-5 py-4 flex flex-col items-center gap-1.5 shadow-[0_20px_60px_-48px_rgba(24,32,40,0.45)]">
            <span className="text-[11px] text-primary/70 tracking-[0.3em]">今 天</span>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              {special.map((s, i) => (
                <span key={i} className="text-sm text-foreground/85">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* 寄语 卡片（主角） */}
        <div className="rounded-[1.9rem] bg-card/80 backdrop-blur border border-border/70 px-6 py-10 flex flex-col items-center gap-5 shadow-[0_26px_80px_-56px_rgba(24,32,40,0.55)]">
          {blessing ? (
            <>
              <span className="text-primary/40 text-2xl leading-none">❝</span>
              <p className="text-xl leading-relaxed text-center text-foreground whitespace-pre-wrap font-light">
                {blessing.content}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                {!blessing.pinned && data?.allBlessings && data.allBlessings.length > 1 && (
                  <button onClick={shuffle} className="hover:text-primary transition-colors">换一句</button>
                )}
                <button onClick={togglePin} className="hover:text-primary transition-colors">
                  {blessing.pinned ? '取消固定' : '固定这句'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">收藏喜欢的话，这里会给你一句。</p>
          )}
        </div>

        {/* 待办 卡片 */}
        {data && data.reminders.length > 0 && (
          <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/60 px-5 py-4 flex flex-col gap-2.5 shadow-sm">
            <span className="text-[11px] text-primary/70 tracking-[0.3em] text-center">待 办</span>
            {data.reminders.map((r) => (
              <div key={r.id} className="flex justify-between items-center text-sm text-foreground/85 border-b border-border/40 last:border-0 pb-2 last:pb-0">
                <span>{r.content}</span>
                {r.remind_at && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {new Date(r.remind_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
            <button onClick={() => router.push('/reminders')} className="text-xs text-muted-foreground hover:text-primary self-center mt-1 transition-colors">
              查看全部
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
