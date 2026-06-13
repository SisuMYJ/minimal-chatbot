'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

import { cn } from '@/lib/utils';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Weather } from './weather';

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  reload,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-card/80 text-primary shadow-sm ring-4 ring-primary/5 backdrop-blur">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {/* 图片附件 */}
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {message.experimental_attachments.map((att, i) =>
                    att.contentType?.startsWith('image/') ? (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={att.name || 'image'}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.url}
                          alt={att.name || 'image'}
                          className="max-w-[240px] rounded-3xl border border-white/70 shadow-lg shadow-primary/5 hover:opacity-90 cursor-pointer dark:border-white/10"
                        />
                      </a>
                    ) : null,
                  )}
                </div>
              )}
            {message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === 'user' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4 leading-relaxed', {
                    'rounded-[1.35rem] rounded-tr-md bg-primary px-4 py-2.5 text-primary-foreground shadow-lg shadow-primary/15':
                      message.role === 'user',
                    'rounded-[1.35rem] rounded-tl-md border border-white/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10':
                      message.role === 'assistant',
                  })}
                >
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                 if (state === 'result') {
                    const { result } = toolInvocation;

                    if (toolName === 'getWeather') {
                      return (
                        <div key={toolCallId}>
                          <Weather weatherAtLocation={result} />
                        </div>
                      );
                    }

                    if (toolName === 'searchMemory') {
                      const memCount = result?.memories?.length ?? 0;
                      if (!result?.found || memCount === 0) {
                        return (
                          <details key={toolCallId} className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer select-none opacity-60 hover:opacity-100">
                              翻了下记忆，没找到相关的
                            </summary>
                          </details>
                        );
                      }
                      return (
                        <details key={toolCallId} className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer select-none opacity-60 hover:opacity-100">
                            想起了 {memCount} 条相关记忆
                          </summary>
                          <ul className="mt-1 ml-4 list-disc flex flex-col gap-1">
                            {result.memories.map((m: { content: string; similarity: number }, i: number) => (
                              <li key={i}>{m.content}</li>
                            ))}
                          </ul>
                        </details>
                      );
                    }

                    // 其他未知工具，保底不显示生 JSON
                    return null;
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? <Weather /> : null}
                    </div>
                  );
                })}
              </div>
            )}

          <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              isLoading={isLoading}
              reload={reload}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-card/80 text-primary shadow-sm ring-4 ring-primary/5">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            正在慢慢想…
          </div>
        </div>
      </div>
    </motion.div>
  );
};
