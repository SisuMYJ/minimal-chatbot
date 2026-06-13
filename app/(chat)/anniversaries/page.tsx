'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type A = { id: number; name: string; month: number; day: number; is_lunar: boolean };

export default function AnniversariesPage() {
  const router = useRouter();
  const [list, setList] = useState<A[]>([]);

  const load = useCallback(async () => {
    const res = await fetch('/api/anniversaries');
    const d = await res.json();
    if (d.ok) setList(d.anniversaries);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const name = window.prompt('纪念日名称（如：布丁来到我身边）');
    if (!name?.trim()) return;
    const md = window.prompt('日期，格式 月-日（如 6-10）');
    if (!md) return;
    const [mm, dd] = md.split('-').map((x) => parseInt(x.trim(), 10));
    if (!mm || !dd) { alert('日期格式不对'); return; }
    const lunar = window.confirm('这是农历日期吗？\n确定=农历，取消=公历');
    await fetch('/api/anniversaries', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), month: mm, day: dd, is_lunar: lunar }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/anniversaries?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="flex flex-col h-dvh overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">纪念日</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={add}>添加</Button>
            <Button variant="ghost" onClick={() => router.push('/me')}>返回</Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">这些日子到了，首页会特别标出来。</p>
        <div className="flex flex-col gap-2">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有纪念日。</p>
          ) : (
            list.map((a) => (
              <div key={a.id} className="rounded-xl border border-border p-3 flex justify-between items-center">
                <div>
                  <span className="text-sm">{a.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {a.is_lunar ? '农历' : ''}{a.month}月{a.day}日
                  </span>
                </div>
                <button onClick={() => del(a.id)} className="text-xs text-muted-foreground hover:text-destructive">删除</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
