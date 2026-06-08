import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  // cookie 里存的就是真 id（apiIdentifier），有就用它，没有才用默认
  const selectedModelId = modelIdFromCookie || DEFAULT_MODEL_NAME;

  return (
    <>
    <Chat id={id} selectedModelId={selectedModelId} />
    </>
  );
}
