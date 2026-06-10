import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { supabaseAdmin } from '@/lib/supabase';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId = modelIdFromCookie || DEFAULT_MODEL_NAME;

  // 从库里读这个会话的历史消息，按时间正序
  const { data: rows } = await supabaseAdmin
    .from('messages')
    .select('id, role, content, created_at')
    .eq('session_id', id)
    .order('created_at', { ascending: true });

  // 转成 useChat 能用的格式
  const initialMessages = (rows ?? []).map((m) => ({
    id: String(m.id),
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  return (
    <Chat
      id={id}
      selectedModelId={selectedModelId}
      initialMessages={initialMessages}
    />
  );
}
