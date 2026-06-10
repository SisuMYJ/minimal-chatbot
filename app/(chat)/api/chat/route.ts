import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
  tool,
} from 'ai';
import { z } from 'zod';
import { customModel } from '@/lib/ai';
import { regularPrompt } from '@/lib/ai/prompts';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';
import { embed } from '@/lib/embedding';

export const maxDuration = 60;

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

  // —— 落库 1：确保 session 存在（不存在就建，标题默认编号）——
  try {
    const { data: existing } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      const { count } = await supabaseAdmin
        .from('sessions')
        .select('id', { count: 'exact', head: true });
      await supabaseAdmin
        .from('sessions')
        .insert({ id, title: `对话 ${(count ?? 0) + 1}` });
    } else {
      // 已存在的会话，更新它的 updated_at，让它排到列表最前
      await supabaseAdmin
        .from('sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
    }
  } catch (e) {
    console.error('SESSION UPSERT ERROR >>>', e);
  }

  // —— 落库 2：存用户这条消息 ——
  try {
    const userText =
      typeof userMessage.content === 'string'
        ? userMessage.content
        : JSON.stringify(userMessage.content);
    await supabaseAdmin.from('messages').insert({
      session_id: id,
      role: 'user',
      content: userText,
    });
  } catch (e) {
    console.error('USER MESSAGE SAVE ERROR >>>', e);
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        model: customModel(modelId),
        system: `${regularPrompt}

你有一个 searchMemory 工具，可以检索你和对方过往对话中沉淀下来的长期记忆。
当对方提到过去的事、你需要回忆起关于对方的偏好/经历/关系/情绪，或任何"你应该记得"的内容时，主动调用它。
不要在每句话都调用——只在真正需要回忆时调用。检索回来的记忆请自然地融入回应，不要生硬复述。`,
        messages: coreMessages,
        maxSteps: 5,
        tools: {
          searchMemory: tool({
            description:
              '检索与当前对话相关的长期记忆。当需要回忆关于对方的事实、偏好、经历、关系或过往对话内容时调用。',
            parameters: z.object({
              query: z
                .string()
                .describe('用于检索记忆的查询语句，描述你想回忆起什么'),
            }),
            execute: async ({ query }) => {
              try {
                const queryVector = await embed(query);
                const { data, error } = await supabaseAdmin.rpc(
                  'match_memories',
                  {
                    query_embedding: JSON.stringify(queryVector),
                    match_count: 5,
                  },
                );
                if (error) {
                  return { found: false, error: error.message, memories: [] };
                }
                const filtered = (data ?? []).filter(
                  (m: { similarity: number }) => m.similarity > 0.15,
                );
                return {
                  found: filtered.length > 0,
                  memories: filtered.map(
                    (m: { content: string; similarity: number }) => ({
                      content: m.content,
                      similarity: Number(m.similarity.toFixed(3)),
                    }),
                  ),
                };
              } catch (e) {
                return { found: false, error: String(e), memories: [] };
              }
            },
          }),
        },
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
        // —— 落库 3：AI 回复完成后，存 AI 这条消息 ——
        onFinish: async ({ text }) => {
          try {
            if (text && text.trim()) {
              await supabaseAdmin.from('messages').insert({
                session_id: id,
                role: 'assistant',
                content: text,
              });
            }
          } catch (e) {
            console.error('ASSISTANT MESSAGE SAVE ERROR >>>', e);
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      console.error('CHAT ERROR >>>', error);
      return error instanceof Error ? error.message : JSON.stringify(error);
    },
  });
}
