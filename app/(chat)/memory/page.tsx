'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type PendingMemory = {
  id: number;
  content: string;
  source: string;
  created_at: string;
};

export default function MemoryReviewPage() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/review');
      const data = await res.json();
      if (data.ok) setPending(data.pending);
    } catch (e) {
      console.error('load pending failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: number) => {
    setBusyId(id);
    try {
      await fetch('/api/memory/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'approve',
          content: editing[id], // 若编辑过就用编辑后的；没编辑是 undefined，接口会用原文
        }),
      });
      setPending((p) => p.filter((m) => m.id !== id));
    } catch (e) {
      console.error('approve failed', e);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: number) => {
    setBusyId(id);
    try {
      await fetch('/api/memory/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      });
      setPending((p) => p.filter((m) => m.id !== id));
    } catch (e) {
      console.error('reject failed', e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            待审记忆 {pending.length > 0 && `(${pending.length})`}
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={load}>
              刷新
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              返回对话
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">加载中…</div>
        ) : pending.length === 0 ? (
          <div className="text-muted-foreground py-8">
            暂无待审记忆。沉淀后，AI 提炼的记忆会出现在这里等你确认。
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-border p-4 flex flex-col gap-3"
              >
                <textarea
                  value={editing[m.id] ?? m.content}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, [m.id]: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-md border border-border bg-transparent p-2 text-sm leading-relaxed outline-none focus:border-foreground resize-y"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    来源：{m.source === 'ai' ? 'AI 沉淀' : m.source}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      disabled={busyId === m.id}
                      onClick={() => reject(m.id)}
                    >
                      丢弃
                    </Button>
                    <Button
                      disabled={busyId === m.id}
                      onClick={() => approve(m.id)}
                    >
                      {busyId === m.id ? '处理中…' : '收入记忆'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
