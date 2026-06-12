'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { models } from '@/lib/ai/models';

type EditorCfg = { tag: string; name: string; model: string };

export default function EditorsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, EditorCfg>>({});
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.ok && data.settings.editors) {
          const arr: EditorCfg[] = JSON.parse(data.settings.editors);
          const map: Record<string, EditorCfg> = {};
          arr.forEach((e) => (map[e.model] = e));
          setSelected(map);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (model: string, label: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[model]) {
        delete next[model];
      } else {
        // 默认标签名用 label，可改
        next[model] = { tag: label.slice(0, 4), name: label, model };
      }
      return next;
    });
  };

  const updateName = (model: string, name: string) => {
    setSelected((prev) => ({
      ...prev,
      [model]: { ...prev[model], name, tag: name.slice(0, 6) },
    }));
  };

  const save = async () => {
    const arr = Object.values(selected);
    if (arr.length === 0) {
      setHint('至少选一个编辑');
      return;
    }
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'editors', value: JSON.stringify(arr) }),
    });
    setHint('已保存');
    setTimeout(() => setHint(''), 2000);
  };

  if (loading) return <div className="p-8 text-muted-foreground">加载中…</div>;

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">编辑名单</h1>
          <Button variant="ghost" onClick={() => router.push('/works')}>返回写作区</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          勾选哪些模型当改稿编辑，改稿页就出现几个独立编辑窗。可给每个起个名字。模型更迭了，来这里改。
        </p>

        <div className="flex flex-col gap-2">
          {models.map((m) => {
            const on = !!selected[m.apiIdentifier];
            return (
              <div
                key={m.id}
                className={`rounded-lg border p-3 flex items-center gap-3 ${
                  on ? 'border-foreground' : 'border-border'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(m.apiIdentifier, m.label)}
                  className="size-4"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.description}</div>
                </div>
                {on && (
                  <input
                    value={selected[m.apiIdentifier].name}
                    onChange={(e) => updateName(m.apiIdentifier, e.target.value)}
                    placeholder="编辑名"
                    className="w-28 rounded-md border border-border bg-transparent px-2 py-1 text-sm outline-none focus:border-foreground"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save}>保存名单</Button>
          {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </div>
  );
}
