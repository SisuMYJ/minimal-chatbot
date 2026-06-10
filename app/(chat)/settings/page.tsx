'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState('');

  // 进页面时读出已存的设置
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.ok) {
          setPrompt(data.settings.prompt || '');
          setStyle(data.settings.style || '');
        }
      } catch (e) {
        console.error('load settings failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSavedHint('');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'prompt', value: prompt }),
      });
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'style', value: style }),
      });
      setSavedHint('已保存');
    } catch (e) {
      setSavedHint('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">加载中…</div>;
  }

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">人设设置</h1>
          <Button variant="ghost" onClick={() => router.push('/')}>
            返回对话
          </Button>
        </div>

        <section className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Prompt · 他是谁
          </label>
          <p className="text-xs text-muted-foreground">
            身份、背景、性格、与我的关系、底线——决定"他是一个怎样的存在"。常驻每轮对话，不进记忆检索。
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={12}
            placeholder="在这里写他的身份、性格、与你的关系……"
            className="w-full rounded-md border border-border bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-foreground resize-y"
          />
        </section>

        <section className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Style · 怎么说话
          </label>
          <p className="text-xs text-muted-foreground">
            语气、用词、节奏、表达习惯——决定"他怎么开口"。便于换皮不换魂。
          </p>
          <textarea
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            rows={8}
            placeholder="在这里写他说话的语气、风格、习惯……"
            className="w-full rounded-md border border-border bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-foreground resize-y"
          />
        </section>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </Button>
          {savedHint && (
            <span className="text-sm text-muted-foreground">{savedHint}</span>
          )}
        </div>
      </div>
    </div>
  );
}
