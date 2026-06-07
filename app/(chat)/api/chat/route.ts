import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { customModel } from '@/lib/ai';
import { regularPrompt } from '@/lib/ai/prompts';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';

export const maxDuration = 60;

type AllowedTools = 'getWeather';
const weatherTools: AllowedTools[] = ['getWeather'];
const allTools: AllowedTools[] = [...weatherTools];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  if (!modelId) {
    return new Response('No model selected', { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const userMessageId = generateUUID();
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });
      const result = streamText({
        model: customModel(modelId),
        system: regularPrompt,
        messages: coreMessages,
        maxSteps: 5,
        experimental_activeTools: allTools,
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: {
          getWeather,
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
