'use client';

import { useRouter } from 'next/navigation';
import { memo, useState, useEffect } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

function PureChatHeader({
  chatId,
  selectedModelId,
  onModelChange,
}: {
  chatId: string;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const [sedimenting, setSedimenting] = useState(false);
  const [hint, setHint] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState<{ remaining: number } | null>(null);
  const [usage, setUsage] = useState<{ model: string; total_tokens: number }[] | null>(null);

  // 待审数量（露出来，看见就审）
  useEffect(() => {
    fetch('/api/memory/pending-count')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setPendingCount(d.count); })
      .catch(() => {});
  }, [chatId]);

  const sedimentNow = async () => {
    if (!chatId) return;
    setSedimenting(true);
    setHint('');
    try {
      const res = await fetch('/api/memory/sediment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: chatId, force: true }),
      });
      const data = await res.json();
      if (data.ok) {
        const n = data.nominated?.length ?? 0;
        setHint(n > 0 ? `已沉淀 ${n} 条` : '暂无可沉淀内容');
      } else {
        setHint('沉淀失败');
      }
    } catch (e) {
      setHint('沉淀失败');
    } finally {
      setSedimenting(false);
      setTimeout(() => setHint(''), 4000);
    }
  };

  const openBalance = async () => {
    setShowBalance((v) => !v);
    if (!balance) {
      try {
        const [b, u] = await Promise.all([
          fetch('/api/balance').then((r) => r.json()),
          fetch('/api/usage-log').then((r) => r.json()),
        ]);
        if (b.ok) setBalance({ remaining: b.remaining });
        if (u.ok) setUsage(u.rows.slice(0, 5));
      } catch {}
    }
  };

  return (
    <header className="flex sticky top-0 z-20 bg-background/90 backdrop-blur py-2 items-center px-3 gap-2 border-b border-border/50">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="px-2 h-[34px]"
              onClick={() => { router.push('/go-chat'); router.refresh(); }}
            >
              <PlusIcon />
              <span className="sr-only">新对话</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>新对话</TooltipContent>
        </Tooltip>
      )}

      <ModelSelector
        selectedModelId={selectedModelId}
        onModelChange={onModelChange}
      />

      <div className="ml-auto flex items-center gap-1.5">
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}

        {/* 待审：有就露出来 */}
        {pendingCount > 0 && (
          <Button
            variant="ghost"
            className="h-[34px] px-2.5 text-xs text-primary hover:bg-accent"
            onClick={() => router.push('/memory')}
          >
            待审 {pendingCount}
          </Button>
        )}

        {/* 搜索：放大镜，点了去搜索页 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="h-[34px] w-[34px] p-0" onClick={() => router.push('/search')}>
              <SearchGlass />
            </Button>
          </TooltipTrigger>
          <TooltipContent>搜索聊天</TooltipContent>
        </Tooltip>

        {/* 余量：点开才看 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="h-[34px] w-[34px] p-0" onClick={openBalance}>
              <CoinIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>余量</TooltipContent>
        </Tooltip>

        {/* 沉淀这段 */}
        <Button
          variant="outline"
          className="py-1.5 px-3 h-[34px] text-xs"
          disabled={sedimenting}
          onClick={sedimentNow}
        >
          {sedimenting ? '沉淀中…' : '沉淀这段'}
        </Button>
      </div>

      {/* 余量弹出小面板 */}
      {showBalance && (
        <div className="absolute right-3 top-14 z-30 w-60 rounded-xl border border-border bg-card p-4 shadow-lg flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">剩余</span>
            <span>{balance ? `$${balance.remaining.toFixed(3)}` : '查询中…'}</span>
          </div>
          {usage && usage.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">最近消耗</div>
              {usage.map((u, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[120px]">{u.model}</span>
                  <span>{u.total_tokens} tk</span>
                </div>
              ))}
            </>
          )}
          <button onClick={() => setShowBalance(false)} className="text-xs text-muted-foreground hover:text-foreground self-end">关闭</button>
        </div>
      )}
    </header>
  );
}

function SearchGlass() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 10h4.5a1.5 1.5 0 0 1 0 3H9" />
    </svg>
  );
}

export const ChatHeader = memo(PureChatHeader);
