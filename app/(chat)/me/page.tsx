'use client';

import { useRouter } from 'next/navigation';

const ITEMS = [
  { label: '人设设置', path: '/settings', desc: '他是谁、怎么说话、写作沟通原则' },
  { label: '编辑名单', path: '/editors', desc: '改稿用哪几个模型' },
  { label: '提醒', path: '/reminders', desc: 'AI 记下的待办' },
  { label: '纪念日', path: '/anniversaries', desc: '生日、特别的日子，到了首页会标出来' },
];

export default function MePage() {
  const router = useRouter();
  return (
    <div
      className="relative flex flex-col h-dvh overflow-y-auto"
      style={{ background: 'linear-gradient(to bottom, hsl(226 55% 96%), hsl(40 33% 98%) 30%)' }}
    >
      <div className="w-full px-5 py-12 flex flex-col gap-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground px-1">我</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ITEMS.map((it) => (
            <button
              key={it.path}
              onClick={() => router.push(it.path)}
              className="text-left rounded-2xl bg-card/80 backdrop-blur border border-border/60 px-6 py-6 hover:border-primary/40 hover:bg-card transition-all shadow-sm flex flex-col gap-2 min-h-[110px] justify-center"
            >
              <div className="text-base font-medium text-foreground">{it.label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{it.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
