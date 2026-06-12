'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Work = { id: number; title: string; kind: string; info: string };
type Chapter = { id: number; chapter_no: number | null; title: string; status: string };
type Track = { id: number; kind: string; content: string; status: string; source: string };

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params?.id as string;

  const [work, setWork] = useState<Work | null>(null);
  const [info, setInfo] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [savingInfo, setSavingInfo] = useState(false);

  const load = useCallback(async () => {
    const [wRes, cRes, tRes] = await Promise.all([
      fetch('/api/works').then((r) => r.json()),
      fetch(`/api/chapters?work_id=${workId}`).then((r) => r.json()),
      fetch(`/api/tracks?work_id=${workId}&status=open`).then((r) => r.json()),
    ]);
    if (wRes.ok) {
      const w = wRes.works.find((x: Work) => String(x.id) === workId);
      setWork(w || null);
      setInfo(w?.info || '');
    }
    if (cRes.ok) setChapters(cRes.chapters);
    if (tRes.ok) setTracks(tRes.tracks);
  }, [workId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveInfo = async () => {
    setSavingInfo(true);
    await fetch('/api/works', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(workId), info }),
    });
    setSavingInfo(false);
  };

  const addChapter = async () => {
    const nextNo = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_no || 0)) + 1 : 1;
    const title = window.prompt('章节标题（可留空）', `第${nextNo}章`) ?? '';
    await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_id: Number(workId), chapter_no: nextNo, title }),
    });
    load();
  };

  const addTrack = async () => {
    const content = window.prompt('记一条伏笔/设定（如：第3章埋了他怕水，待呼应）');
    if (!content || !content.trim()) return;
    await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_id: Number(workId), content: content.trim(), kind: 'foreshadow', source: 'manual' }),
    });
    load();
  };

  const closeTrack = async (id: number) => {
    await fetch('/api/tracks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'closed' }),
    });
    load();
  };

  if (!work) return <div className="p-8 text-muted-foreground">加载中…</div>;

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{work.title}</h1>
          <Button variant="ghost" onClick={() => router.push('/works')}>返回写作区</Button>
        </div>

        {/* 基本信息 */}
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">基本信息（人设/梗概/世界观）</h2>
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            onBlur={saveInfo}
            rows={6}
            placeholder="边写边补，人设、梗概、世界观、金手指规则…"
            className="w-full rounded-md border border-border bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-foreground resize-y"
          />
          <span className="text-xs text-muted-foreground">{savingInfo ? '保存中…' : '失焦自动保存'}</span>
        </section>

        {/* 伏笔追踪（待呼应） */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">待呼应 {tracks.length > 0 && `(${tracks.length})`}</h2>
            <Button variant="outline" onClick={addTrack}>记一条</Button>
          </div>
          {tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">没有待呼应的伏笔。</p>
          ) : (
            tracks.map((t) => (
              <div key={t.id} className="rounded-md border border-border p-3 flex items-start justify-between gap-2 text-sm">
                <span className="flex-1">{t.content}</span>
                <Button variant="ghost" className="text-xs shrink-0" onClick={() => closeTrack(t.id)}>已了结</Button>
              </div>
            ))
          )}
        </section>

        {/* 章节 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">章节</h2>
            <Button variant="outline" onClick={addChapter}>新建章节</Button>
          </div>
          {chapters.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有章节。</p>
          ) : (
            chapters.map((c) => (
              <div key={c.id} className="rounded-md border border-border p-3 flex items-center justify-between text-sm">
                <span>
                  {c.chapter_no ? `第${c.chapter_no}章` : ''} {c.title}
                  {c.status === 'final' && <span className="ml-2 text-xs text-green-600">已定稿</span>}
                </span>
                <Button variant="ghost" onClick={() => router.push(`/works/${workId}/chapter/${c.id}`)}>打开</Button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
