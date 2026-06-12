'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Work = {
  id: number;
  title: string;
  kind: string;
  info: string;
  updated_at: string;
};

export default function WorksPage() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/works');
      const data = await res.json();
      if (data.ok) setWorks(data.works);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createWork = async (kind: 'novel' | 'idea') => {
    const title = window.prompt(kind === 'novel' ? '正文标题' : '灵感标题');
    if (!title || !title.trim()) return;
    await fetch('/api/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), kind }),
    });
    load();
  };

  const toNovel = async (w: Work) => {
    if (!confirm(`把「${w.title}」转为正文、开始写作？`)) return;
    await fetch('/api/works', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: w.id, kind: 'novel' }),
    });
    load();
  };

  const del = async (w: Work) => {
    if (!confirm(`删除「${w.title}」？章节和追踪也会一起删除。`)) return;
    await fetch(`/api/works?id=${w.id}`, { method: 'DELETE' });
    load();
  };

  const novels = works.filter((w) => w.kind === 'novel');
  const ideas = works.filter((w) => w.kind === 'idea');

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">写作区</h1>
      <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push('/editors')}>编辑名单</Button>
            <Button variant="ghost" onClick={() => router.push('/')}>返回对话</Button>
          </div>
        </div>

        {/* 正文 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">正文</h2>
            <Button variant="outline" onClick={() => createWork('novel')}>新建正文</Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">加载中…</p>
          ) : novels.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有正文。</p>
          ) : (
            novels.map((w) => (
              <div key={w.id} className="rounded-lg border border-border p-4 flex items-center justify-between">
                <button
                  type="button"
                  className="text-left flex-1 font-medium hover:underline"
                  onClick={() => router.push(`/works/${w.id}`)}
                >
                  {w.title}
                </button>
                <Button variant="ghost" className="text-destructive" onClick={() => del(w)}>删除</Button>
              </div>
            ))
          )}
        </section>

        {/* 灵感 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">灵感档案</h2>
            <Button variant="outline" onClick={() => createWork('idea')}>新建灵感</Button>
          </div>
          {ideas.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有灵感。</p>
          ) : (
            ideas.map((w) => (
              <div key={w.id} className="rounded-lg border border-border p-4 flex items-center justify-between">
                <button
                  type="button"
                  className="text-left flex-1 hover:underline"
                  onClick={() => router.push(`/works/${w.id}`)}
                >
                  {w.title}
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => toNovel(w)}>开篇转正文</Button>
                  <Button variant="ghost" className="text-destructive" onClick={() => del(w)}>删除</Button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
