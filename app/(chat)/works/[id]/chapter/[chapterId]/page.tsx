'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// 可配置的模型列表（以后换模型改这里就行）
const EDITORS = [
  { tag: 'CC', name: '编辑CC', model: 'anthropic/claude-opus-4.8' },
  { tag: 'GG', name: '编辑GG', model: 'openai/gpt-5.5' },
  { tag: 'GE', name: '编辑GE', model: 'google/gemini-3-flash-preview' },
  { tag: 'DS', name: '编辑DS', model: 'deepseek/deepseek-v4-pro' },
];

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params?.id as string;
  const chapterId = (params as Record<string, string>)?.['chapterId'] ?? '';
  // 注意：动态路由第二段的参数名见文末说明

  const [content, setContent] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNo, setChapterNo] = useState<number | null>(null);
  const [status, setStatus] = useState('draft');
  const [savingDoc, setSavingDoc] = useState(false);

  // 每个编辑窗一份独立对话
  const [activeTab, setActiveTab] = useState('CC');
  const [convos, setConvos] = useState<Record<string, Msg[]>>({
    CC: [], GG: [], GE: [], DS: [],
  });
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 取章节本体
  const loadChapter = useCallback(async () => {
    const res = await fetch(`/api/chapters?id=${chapterId}`);
    const data = await res.json();
    if (data.ok && data.chapter) {
      setContent(data.chapter.content || '');
      setChapterTitle(data.chapter.title || '');
      setChapterNo(data.chapter.chapter_no);
      setStatus(data.chapter.status || 'draft');
    }
  }, [chapterId]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [convos, activeTab]);

  const saveDoc = async () => {
    setSavingDoc(true);
    await fetch('/api/chapters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(chapterId), content }),
    });
    setSavingDoc(false);
  };

  const finalize = async () => {
    if (!confirm('确定这章定稿吗？定稿后会存档。')) return;
    await fetch('/api/chapters', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(chapterId), content, status: 'final' }),
    });
    setStatus('final');
    alert('已定稿存档。');
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    const editor = EDITORS.find((e) => e.tag === activeTab)!;

    // 第一次跟这个编辑说话时，自动把章节正文带上
    const isFirst = convos[activeTab].length === 0;
    const userContent = isFirst
      ? `这是我的章节正文，请你看完给改稿意见：\n\n${content}\n\n———\n我的话：${text}`
      : text;

    const newUserMsg: Msg = { role: 'user', content: userContent };
    const displayMsg: Msg = { role: 'user', content: text }; // 界面只显示你打的字，不重复整章

    setConvos((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], displayMsg] }));
    setInput('');
    setStreaming(true);

    // 发给改稿接口的完整消息（含真正带正文的那条）
    const sendMessages = [
      ...convos[activeTab].map((m) => ({ role: m.role, content: m.content })),
      newUserMsg,
    ];

    try {
      const res = await fetch('/api/writing-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: sendMessages,
          model: editor.model,
          workId: Number(workId),
        }),
      });

      if (!res.ok || !res.body) {
        setConvos((prev) => ({
          ...prev,
          [activeTab]: [...prev[activeTab], { role: 'assistant', content: '（出错了，稍后再试）' }],
        }));
        setStreaming(false);
        return;
      }

      // 流式读取
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setConvos((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], { role: 'assistant', content: '' }] }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) {
              acc += delta;
              setConvos((prev) => {
                const arr = [...prev[activeTab]];
                arr[arr.length - 1] = { role: 'assistant', content: acc };
                return { ...prev, [activeTab]: arr };
              });
            }
          } catch {
            // 忽略解析不了的行
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStreaming(false);
    }
  };

  const activeConvo = convos[activeTab] || [];

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(`/works/${workId}`)}>← 返回</Button>
          <span className="font-medium">
            {chapterNo ? `第${chapterNo}章` : ''} {chapterTitle}
            {status === 'final' && <span className="ml-2 text-xs text-green-600">已定稿</span>}
          </span>
        </div>
        <Button onClick={finalize} disabled={status === 'final'}>
          {status === 'final' ? '已定稿' : '定稿存档'}
        </Button>
      </div>

      {/* 主体：左正文 右改稿 */}
      <div className="flex flex-1 min-h-0">
        {/* 左：正文 */}
        <div className="w-1/2 flex flex-col border-r border-border">
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border flex justify-between items-center">
            <span>章节正文</span>
            <button onClick={saveDoc} className="hover:text-foreground">
              {savingDoc ? '保存中…' : '保存正文'}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveDoc}
            placeholder="在这里写或粘贴章节正文……"
            className="flex-1 w-full p-4 text-sm leading-relaxed outline-none resize-none bg-transparent"
          />
        </div>

        {/* 右：改稿窗 */}
        <div className="w-1/2 flex flex-col">
          {/* 编辑分页签 */}
          <div className="flex border-b border-border">
            {EDITORS.map((e) => (
              <button
                key={e.tag}
                onClick={() => setActiveTab(e.tag)}
                className={`flex-1 px-3 py-2 text-sm ${
                  activeTab === e.tag
                    ? 'border-b-2 border-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>

          {/* 对话区 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {activeConvo.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                发第一句话，会自动带上左边的章节正文给「{EDITORS.find((e) => e.tag === activeTab)?.name}」看。每个编辑独立，互不影响。
              </p>
            ) : (
              activeConvo.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                  <div
                    className={`inline-block rounded-lg px-3 py-2 text-sm whitespace-pre-wrap text-left max-w-[90%] ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 输入 */}
          <div className="border-t border-border p-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={`对「${EDITORS.find((e) => e.tag === activeTab)?.name}」说…（Enter发送，Shift+Enter换行）`}
              className="flex-1 rounded-md border border-border bg-transparent p-2 text-sm outline-none resize-none"
            />
            <Button onClick={send} disabled={streaming}>
              {streaming ? '…' : '发送'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
