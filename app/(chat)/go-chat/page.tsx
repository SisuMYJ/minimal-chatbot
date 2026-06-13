import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { generateUUID } from '@/lib/utils';

export default async function GoChat() {
  // 找最近更新的、非历史导入的对话
  const { data } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .not('id', 'like', 'gpt_history_%')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    redirect(`/chat/${data[0].id}`);
  }
  redirect(`/chat/${generateUUID()}`);
}
