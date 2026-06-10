import { redirect } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const id = generateUUID();
  redirect(`/chat/${id}`);
}
