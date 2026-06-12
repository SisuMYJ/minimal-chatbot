'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Reminder = {
  id: number;
  content: string;
  remind_at: string | null;
  done: boolean;
};

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      if (data.ok) setReminders(data.reminders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addManual = async () => {
    const content = window.prompt('提醒内容');
    if (!content || !content.trim()) return;
    const timeStr = window.prompt('时间（可留空）例如：2026-06-13 15:00', '');
    let remind_at: string | null = null;
    if (timeStr && timeStr.trim()) {
      const d = new Date(timeStr.replace(' ', 'T') + '+08:00');
      if (!isNaN(d.getTime())) remind_at = d.toISOString();
    }
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), remind_at }),
    });
    load();
  };

  const toggleDone = async (r: Reminder) => {
    await fetch('/api/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: r.id, done: !r.done }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' });
    load();
  };

  const fmt = (iso: string | null) => {
    if (!iso) return '无时间';
    return new Date(iso).toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const now = Date.now();
  const active = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">提醒</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addManual}>手动加</Button>
            <Button variant="ghost" onClick={() => router.push('/')}>返回对话</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">加载中…</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {active.length === 0 ? (
                <p className="text-sm text-muted-foreground">没有待办提醒。聊天时跟AI说“提醒我…”就会记在这。</p>
              ) : (
                active.map((r) => {
                  const overdue = r.remind_at && new Date(r.remind_at).getTime() < now;
                  return (
                    <div key={r.id} className="rounded-lg border border-border p-3 flex items-center gap-3">
                      <input type="checkbox" checked={r.done} onChange={() => toggleDone(r)} className="size-4" />
                      <div className="flex-1">
                        <div className="text-sm">{r.content}</div>
                        <div className={`text-xs ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {fmt(r.remind_at)}{overdue ? ' · 已过时间' : ''}
                        </div>
                      </div>
                      <button onClick={() => del(r.id)} className="text-xs text-muted-foreground hover:text-destructive">删除</button>
                    </div>
                  );
                })
              )}
            </div>

            {done.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">已完成</h2>
                {done.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border/50 p-3 flex items-center gap-3 opacity-60">
                    <input type="checkbox" checked={r.done} onChange={() => toggleDone(r)} className="size-4" />
                    <div className="flex-1 text-sm line-through">{r.content}</div>
                    <button onClick={() => del(r.id)} className="text-xs text-muted-foreground hover:text-destructive">删除</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
