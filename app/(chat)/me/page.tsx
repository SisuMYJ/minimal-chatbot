'use client';

import { useRouter } from 'next/navigation';

const ITEMS = [
  { label: '人设设置', path: '/settings', desc: '他是谁、怎么说话、写作沟通原则' },
  { label: '编辑名单', path: '/editors', desc: '改稿用哪几个模型' },
  { label: '提醒', path: '/reminders', desc: 'AI 记下的待办' },
  { label: '搜索聊天记录', path: '/search', desc: '关键词搜所有对话' },
  { label: '余量', path: '/balance', desc: '余额与消耗' },
];

export default function MePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col h-dvh overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">我</h1>
        <div className="flex flex-col gap-2">
          {ITEMS.map((it) => (
            <button
              key={it.path}
              onClick={() => router.push(it.path)}
              className="text-left rounded-xl border border-border p-4 hover:bg-muted transition-colors"
            >
              <div className="text-sm font-medium">{it.label}</div>
              <div className="text-xs text-muted-foreground">{it.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
