import type { ChatRequestOptions, Message } from 'ai';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import { CopyIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function PureMessageActions({
  message,
  isLoading,
  reload,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  reload?: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const [favorited, setFavorited] = useState(false);

  if (isLoading) return null;
  if (message.role === 'user') return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        {/* 复制 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                await copyToClipboard(message.content);
                toast.success('已复制');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>复制</TooltipContent>
        </Tooltip>

        {/* 重新生成 */}
        {reload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="py-1 px-2 h-fit text-muted-foreground"
                variant="outline"
                onClick={() => reload()}
              >
                ↻
              </Button>
            </TooltipTrigger>
            <TooltipContent>重新生成</TooltipContent>
          </Tooltip>
        )}

        {/* 收藏到寄语（小爱心） */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={`py-1 px-2 h-fit ${favorited ? 'text-red-500' : 'text-muted-foreground'}`}
              variant="outline"
              onClick={async () => {
                if (favorited) return;
                const res = await fetch('/api/favorite-message', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ content: message.content }),
                });
                const d = await res.json();
                if (d.ok) {
                  setFavorited(true);
                  toast.success('已收藏到寄语');
                } else {
                  toast.error('收藏失败');
                }
              }}
            >
              {favorited ? '♥' : '♡'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{favorited ? '已收藏' : '收藏到寄语'}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    return true;
  },
);
