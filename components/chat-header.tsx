'use client';

import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
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

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}
      <ModelSelector
        selectedModelId={selectedModelId}
        onModelChange={onModelChange}
        className="order-1 md:order-2"
      />

      <div className="order-4 md:ml-auto flex items-center gap-2">
        {hint && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
        <Button
          variant="outline"
          className="py-1.5 px-3 h-fit md:h-[34px]"
          disabled={sedimenting}
          onClick={sedimentNow}
        >
          {sedimenting ? '沉淀中…' : '沉淀这段'}
        </Button>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader);
