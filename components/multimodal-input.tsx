'use client';

import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  type Dispatch,
  type SetStateAction,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { sanitizeUIMessages } from '@/lib/utils';
import { ArrowUpIcon, StopIcon, PaperclipIcon, SmileIcon } from './icons';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
  if (ref.current) {
    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight + 2}px`;
  }
};

const resetHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
  if (ref.current) {
    ref.current.style.height = 'auto';
    ref.current.style.height = '98px';
  }
};

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowSize();
  const [attachments, setAttachments] = useState<{ url: string; name: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [stickers, setStickers] = useState<{ id: number; url: string }[]>([]);

  const loadStickers = useCallback(async () => {
    const res = await fetch('/api/stickers');
    const data = await res.json();
    if (data.ok) setStickers(data.stickers);
  }, []);

  useEffect(() => { loadStickers(); }, [loadStickers]);

  const uploadSticker = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      await fetch('/api/stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      });
      loadStickers();
    }
  };

  const sendSticker = (url: string) => {
    setShowStickers(false);
    append({
      role: 'user',
      content: '',
      experimental_attachments: [{ url, contentType: 'image/png', name: 'sticker' }],
    } as any);
  };

  useEffect(() => {
    if (textareaRef.current) adjustHeight(textareaRef);
  }, []);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage('input', '');

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight(textareaRef);
    }
  }, [setInput, localStorageInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight(textareaRef);
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.ok) {
          setAttachments((prev) => [...prev, { url: data.url, name: data.name, type: data.type }]);
        } else {
          toast.error('上传失败');
        }
      }
    } catch {
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // 把图片附件作为 experimental_attachments 一起发
    const imageAttachments = attachments
      .filter((a) => a.type.startsWith('image/'))
      .map((a) => ({ url: a.url, name: a.name, contentType: a.type }));

    handleSubmit(undefined, {
      experimental_attachments: imageAttachments.length > 0 ? imageAttachments : undefined,
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight(textareaRef);
    if (width && width > 768) textareaRef.current?.focus();
  }, [handleSubmit, setLocalStorageInput, width, chatId, attachments]);

  return (
    <div className="relative w-full flex flex-col gap-4 max-w-full overflow-x-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            <div key={i} className="relative">
              {a.type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt={a.name} className="size-16 object-cover rounded-md border border-border" />
              ) : (
                <div className="size-16 flex items-center justify-center rounded-md border border-border text-xs p-1 text-center">{a.name}</div>
              )}
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 bg-background border border-border rounded-full size-5 text-xs leading-none"
              >×</button>
            </div>
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="发消息…"
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 pl-12 dark:border-zinc-700',
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (isLoading) {
              toast.error('等模型回复完再发哦');
            } else {
              submitForm();
            }
          }
        }}
      />

    {/* 左下：上传 + 表情 */}
      <div className="absolute bottom-0 left-0 p-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full p-1.5 h-fit"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? '…' : <PaperclipIcon size={16} />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="rounded-full p-1.5 h-fit"
          onClick={() => setShowStickers((v) => !v)}
        >
          <SmileIcon size={16} />
        </Button>
      </div>

      {/* 表情面板 */}
      {showStickers && (
        <div className="absolute bottom-14 left-0 z-10 w-72 max-h-64 overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-lg">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs text-muted-foreground">我的表情</span>
            <button
              type="button"
              className="text-xs hover:text-foreground"
              onClick={() => stickerInputRef.current?.click()}
            >
              + 上传
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {stickers.map((s) => (
              <button key={s.id} type="button" onClick={() => sendSticker(s.url)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt="sticker" className="size-14 object-cover rounded-md hover:ring-2 ring-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 发送/停止（右下） */}
      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isLoading ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton input={input} submitForm={submitForm} hasAttachment={attachments.length > 0} />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    return true;
  },
);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}
const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  hasAttachment,
}: {
  submitForm: () => void;
  input: string;
  hasAttachment: boolean;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 && !hasAttachment}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}
const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.hasAttachment !== nextProps.hasAttachment) return false;
  return true;
});
