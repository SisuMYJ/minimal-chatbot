'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Hit = {
  session_id: string;
  session_title: string;
  role: string;
  snippet: string;
  created_at: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [kw, setKw] = useState('');
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!kw.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search-messages?kw=${encodeURIComponent(kw.trim())}`);
      const data = await res.json();
      if (data.ok) setHits(data.hits);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">搜索聊天记录</h1>
          <Button variant="ghost" onClick={() => router.push('/')}>返回对话</Button>
        </div>

        <div className="flex gap-2">
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
            placeholder="输入关键词，搜所有对话（含导入的历史）"
            className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
          />
          <Button onClick={search} disabled={loading}>{loading ? '搜索中…' : '搜索'}</Button>
        </div>

        {hits !== null && (
          <div className="flex flex-col gap-3">
            <span className="text-sm text-muted-foreground">找到 {hits.length} 条{hits.length >= 100 && '（最多显示100条）'}</span>
            {hits.map((h, i) => (
              <button
                key={i}
                onClick={() => router.push(`/chat/${h.session_id}`)}
                className="text-left rounded-lg border border-border p-3 hover:bg-muted"
              >
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{h.session_title} · {h.role === 'user' ? '我' : 'AI'}</span>
                  <span>{new Date(h.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{h.snippet}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
