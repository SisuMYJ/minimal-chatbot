'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { models } from '@/lib/ai/models';

export default function PinnedModelsPage() {
  const router = useRouter();
  const [pinned, setPinned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.ok && data.settings.pinned_models) {
          setPinned(JSON.parse(data.settings.pinned_models));
        } else {
          setPinned(models.map((m) => m.apiIdentifier)); // 默认全选
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (api: string) => {
    setPinned((prev) =>
      prev.includes(api) ? prev.filter((x) => x !== api) : [...prev, api],
    );
  };

  const save = async () => {
    if (pinned.length === 0) { setHint('至少选一个'); return; }
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'pinned_models', value: JSON.stringify(pinned) }),
    });
    setHint('已保存，刷新对话页生效');
    setTimeout(() => setHint(''), 3000);
  };

  if (loading) return <div className="p-8 text-muted-foreground">加载中…</div>;

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">置顶模型</h1>
          <Button variant="ghost" onClick={() => router.push('/')}>返回对话</Button>
        </div>
        <p className="text-sm text-muted-foreground">勾选的模型才出现在对话框的模型选择器里。</p>
        <div className="flex flex-col gap-2">
          {models.map((m) => {
            const on = pinned.includes(m.apiIdentifier);
            return (
              <div key={m.id} className={`rounded-lg border p-3 flex items-center gap-3 ${on ? 'border-foreground' : 'border-border'}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(m.apiIdentifier)} className="size-4" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.description}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={save}>保存</Button>
          {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
