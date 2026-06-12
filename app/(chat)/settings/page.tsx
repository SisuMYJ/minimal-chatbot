'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [writingPrompt, setWritingPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.ok) {
          setPrompt(data.settings.prompt || '');
          setStyle(data.settings.style || '');
          setWritingPrompt(data.settings.writing_prompt || '');
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
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'writing_prompt', value: writingPrompt }),
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
          <label className="text-sm font-medium">Prompt · 他是谁</label>
          <p className="text-xs text-muted-foreground">always you</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={12}
            placeholder="在这里写他的身份、性格、与你的关系……"
            className="w-full rounded-md border border-border bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-foreground resize-y"
          />
        </section>

        <section className="flex flex-col gap-2">
          <label className="text-sm font-medium">Style · 怎么说话</label>
          <p className="text-xs text-muted-foreground">what's your style</p>
          <textarea
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            rows={8}
            placeholder="在这里写他说话的语气、风格、习惯……"
            className="w-full rounded-md border border-border bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-foreground resize-y"
          />
        </section>

        <section className="flex flex-col gap-2 border-t border-border pt-6">
          <label className="text-sm font-medium">写作区专享设定 · 改稿沟通原则</label>
          <p className="text-xs text-muted-foreground">
            继承上面的总设定，额外叠加：改稿时的沟通原则、态度、雷区（如严苛盯文笔、别空洞夸、别套路兜底）。只在写作区改稿时生效。
          </p>
          <textarea
            value={writingPrompt}
            onChange={(e) => setWritingPrompt(e.target.value)}
            rows={12}
            placeholder="改稿时你希望AI怎么对待我的稿子：严到什么程度、盯什么（文笔节奏/情绪/结构）、绝不要的（空洞鼓励、对比式夸奖、过度道歉、顺着我说）……"
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
