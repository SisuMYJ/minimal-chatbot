'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

type Session = {
  id: string;
  title: string;
  folder: string | null;
  updated_at: string;
};

export function SidebarHistory() {
  const router = useRouter();
  const params = useParams();
  const currentId = (params?.id as string) || '';
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.ok) setSessions(data.sessions);
    } catch (e) {
      console.error('load sessions failed', e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, currentId]);

  const patchSession = async (id: string, body: Record<string, unknown>) => {
    await fetch('/api/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    load();
  };

  const handleRename = (s: Session) => {
    const title = window.prompt('新名字', s.title);
    if (title && title.trim()) patchSession(s.id, { title: title.trim() });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个对话吗？消息也会一起删除。')) return;
    await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
    if (id === currentId) router.push('/');
    load();
  };

  const handleMove = (s: Session) => {
    // 现有文件夹列表（去重）
    const existing = Array.from(
      new Set(sessions.map((x) => x.folder).filter(Boolean) as string[]),
    );
    const hint =
      existing.length > 0
        ? `输入文件夹名（移进去）。\n现有文件夹：${existing.join('、')}\n留空=移出文件夹`
        : '输入文件夹名（新建并移进去）。留空=移出文件夹';
    const folder = window.prompt(hint, s.folder || '');
    if (folder === null) return; // 取消
    patchSession(s.id, { folder: folder.trim() ? folder.trim() : null });
  };

  // 分组
  const loose = sessions.filter((s) => !s.folder);
  const folders: Record<string, Session[]> = {};
  sessions.filter((s) => s.folder).forEach((s) => {
    (folders[s.folder!] ||= []).push(s);
  });

  const renderItem = (s: Session) => (
    <div
      key={s.id}
      className={`group flex items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted ${
        s.id === currentId ? 'bg-muted font-medium' : ''
      }`}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            className="flex-1 truncate text-left cursor-pointer select-none"
            style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
            onClick={() => router.push(`/chat/${s.id}`)}
          >
            {s.title}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => handleRename(s)}>改名</ContextMenuItem>
          <ContextMenuItem onSelect={() => handleMove(s)}>移到文件夹…</ContextMenuItem>
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => handleDelete(s.id)}
          >
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );

  if (sessions.length === 0) {
    return <div className="px-2 py-4 text-sm text-muted-foreground">还没有对话</div>;
  }

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {/* 无文件夹的对话 */}
      {loose.map(renderItem)}

      {/* 文件夹（折叠） */}
      {Object.entries(folders).map(([name, items]) => (
        <div key={name} className="mt-1">
          <button
            type="button"
            className="w-full flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setOpenFolders((p) => ({ ...p, [name]: !p[name] }))}
          >
            <span className="text-xs">{openFolders[name] ? '▾' : '▸'}</span>
            <span className="truncate">{name}</span>
            <span className="ml-auto text-xs">{items.length}</span>
          </button>
          {openFolders[name] && (
            <div className="flex flex-col gap-1 pl-2">{items.map(renderItem)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
