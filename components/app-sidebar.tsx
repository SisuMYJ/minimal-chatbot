'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { SidebarHistory } from './sidebar-history';
import { generateUUID } from '@/lib/utils';

export function AppSidebar() {
  const router = useRouter();
  const params = useParams();
  const { setOpenMobile } = useSidebar();
  const [sedimenting, setSedimenting] = useState(false);
  const [sedimentHint, setSedimentHint] = useState('');

  const currentId = (params?.id as string) || '';

  const sedimentNow = async () => {
    if (!currentId) {
      setSedimentHint('请先进入一个对话');
      return;
    }
    setSedimenting(true);
    setSedimentHint('');
    try {
      const res = await fetch('/api/memory/sediment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentId, force: true }),
      });
      const data = await res.json();
      if (data.ok) {
        const n = data.nominated?.length ?? 0;
        setSedimentHint(n > 0 ? `已沉淀 ${n} 条，去待审看看` : '这段暂无可沉淀的内容');
      } else {
        setSedimentHint('沉淀失败');
      }
    } catch (e) {
      setSedimentHint('沉淀失败');
    } finally {
      setSedimenting(false);
    }
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    const newId = generateUUID();
                    router.push(`/chat/${newId}`);
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      <div className="flex-1 overflow-y-auto">
        <SidebarHistory />
      </div>

    <div className="border-t border-sidebar-border p-2 flex flex-col gap-1">
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start text-sm"
          disabled={sedimenting}
          onClick={sedimentNow}
        >
          {sedimenting ? '沉淀中…' : '立即沉淀这段'}
        </Button>
        {sedimentHint && (
          <span className="px-2 text-xs text-muted-foreground">{sedimentHint}</span>
        )}
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start text-sm"
          onClick={() => {
            setOpenMobile(false);
            router.push('/memory');
          }}
        >
          待审记忆
        </Button>
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start text-sm"
          onClick={() => {
            setOpenMobile(false);
            router.push('/settings');
          }}
        >
          人设设置
        </Button>
      </div>
    </Sidebar>
  );
}
