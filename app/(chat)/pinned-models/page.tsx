'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type M = { id: string; name: string; vision: boolean };

export default function PinnedModelsPage() {
  const router = useRouter();
  const [all, setAll] = useState<M[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [kw, setKw] = useState('');
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch('/api/all-models').then((r) => r.json()),
          fetch('/api/settings').then((r) => r.json()),
        ]);
        if (mRes.ok) setAll(mRes.models);
        if (sRes.ok && sRes.settings.pinned_models) {
          setPinned(JSON.parse(sRes.settings.pinned_models));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id: string) => {
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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

  // 搜索过滤；已勾选的始终显示在最前
  const shown = useMemo(() => {
    const k = kw.trim().toLowerCase();
    const filtered = k
      ? all.filter((m) => m.id.toLowerCase().includes(k) || m.name.toLowerCase().includes(k))
      : all;
    // 已选的排前面
    const selectedItems = all.filter((m) => pinned.includes(m.id));
    const rest = filtered.filter((m) => !pinned.includes(m.id));
    return [...selectedItems.filter((m) => !k || filtered.includes(m)), ...rest].slice(0, 100);
  }, [all, kw, pinned]);

  if (loading) return <div className="p-8 text-muted-foreground">加载中…（拉取模型列表）</div>;

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">置顶模型</h1>
          <Button variant="ghost" onClick={() => router.push('/')}>返回对话</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          从 OpenRouter 所有模型里搜索、勾选。勾选的才出现在对话框模型选择器里。已选 {pinned.length} 个。
        </p>

        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="搜索模型名（如 claude、gpt、gemini、deepseek…）"
          className="rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />

        <div className="flex flex-col gap-1">
          {shown.map((m) => {
            const on = pinned.includes(m.id);
            return (
              <div key={m.id} className={`rounded-lg border p-2 flex items-center gap-3 ${on ? 'border-foreground' : 'border-border'}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(m.id)} className="size-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.id}{m.vision ? ' · 👁可看图' : ''}</div>
                </div>
              </div>
            );
          })}
          {shown.length === 0 && <p className="text-sm text-muted-foreground">没找到匹配的模型。</p>}
        </div>

        <div className="flex items-center gap-3 sticky bottom-0 bg-background py-3">
          <Button onClick={save}>保存</Button>
          {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
