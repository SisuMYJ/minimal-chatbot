'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function Chat({
  id,
  selectedModelId,
  initialMessages = [],
}: {
  id: string;
  selectedModelId: string;
  initialMessages?: Array<any>;
}) {
  const [currentModelId, setCurrentModelId] = useState(selectedModelId);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    initialMessages,
    body: { id, modelId: currentModelId },
    experimental_throttle: 100,
  });

  return (
    <div className="relative flex h-dvh min-w-0 flex-col overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#8fd3e8]/18 via-primary/5 to-transparent" />
      <ChatHeader
        chatId={id}
        selectedModelId={currentModelId}
        onModelChange={setCurrentModelId}
      />
      <Messages
        chatId={id}
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
      />
      <form className="relative z-10 flex mx-auto px-4 pb-12 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
