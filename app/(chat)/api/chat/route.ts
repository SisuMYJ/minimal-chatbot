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

  // —— 读常驻人设层（Prompt + Style）——
  let personaPrompt = '';
  let personaStyle = '';
  try {
    const { data: settingRows } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['prompt', 'style']);
    (settingRows ?? []).forEach((row) => {
      if (row.key === 'prompt') personaPrompt = row.value || '';
      if (row.key === 'style') personaStyle = row.value || '';
    });
  } catch (e) {
    console.error('LOAD PERSONA ERROR >>>', e);
  }

  // —— 时间感：当前时间 + 这个会话上一条消息是多久前 ——
  let timeContext = '';
  try {
    const now = new Date();
    // 用上海时区显示当前时间（你在上海）
    const nowStr = now.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 查这个会话最近一条消息的时间，算距今多久
    const { data: lastMsg } = await supabaseAdmin
      .from('messages')
      .select('created_at')
      .eq('session_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let gapHint = '这是这段对话的开始。';
    if (lastMsg?.created_at) {
      const last = new Date(lastMsg.created_at).getTime();
      const diffMin = Math.round((now.getTime() - last) / 60000);
      if (diffMin < 1) {
        gapHint = '距上一条消息刚刚过去不到一分钟，是连续对话。';
      } else if (diffMin < 60) {
        gapHint = `距上一条消息过去了约 ${diffMin} 分钟。`;
      } else if (diffMin < 60 * 24) {
        gapHint = `距上一条消息过去了约 ${Math.round(diffMin / 60)} 小时。`;
      } else {
        gapHint = `距上一条消息已经过去了约 ${Math.round(diffMin / 60 / 24)} 天，这中间隔了挺久。`;
      }
    }

    timeContext = `【此刻】现在是 ${nowStr}（北京时间）。${gapHint}请把时间感纳入理解——隔了很久的事不要当成刚刚发生。`;
  } catch (e) {
    console.error('TIME CONTEXT ERROR >>>', e);
  }

  // —— 组装 system：时间感 + 人设 + 工具说明 ——
  const systemParts: string[] = [];
  if (timeContext) {
    systemParts.push(timeContext);
  }
  if (personaPrompt.trim()) {
    systemParts.push(`【你是谁】\n${personaPrompt.trim()}`);
  }
  if (personaStyle.trim()) {
    systemParts.push(`【你怎么说话】\n${personaStyle.trim()}`);
  }
  if (!personaPrompt.trim() && !personaStyle.trim()) {
    systemParts.push(regularPrompt);
  }
  systemParts.push(
    `你有一个 searchMemory 工具，可以检索你和对方过往对话中沉淀下来的长期记忆。当对方提到过去的事、你需要回忆起关于对方的偏好/经历/关系/情绪，或任何"你应该记得"的内容时，主动调用它。不要在每句话都调用——只在真正需要回忆时调用。检索回来的记忆请自然地融入回应，不要生硬复述。`
  );
  const systemPrompt = systemParts.join('\n\n');

  // —— 落库 1：确保 session 存在 ——
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
        system: systemPrompt,
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
