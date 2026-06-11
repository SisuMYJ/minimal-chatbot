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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
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

  const handleRename = async (id: string) => {
    const title = editingTitle.trim();
    setEditingId(null);
    if (!title) return;
    await fetch('/api/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个对话吗？消息也会一起删除。')) return;
    await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
    if (id === currentId) router.push('/');
    load();
  };

  const loose = sessions.filter((s) => !s.folder);
  const folders: Record<string, Session[]> = {};
  sessions.filter((s) => s.folder).forEach((s) => {
    (folders[s.folder!] ||= []).push(s);
  });

  const renderItem = (s: Session) => (
    <div
      key={s.id}
      className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted ${
        s.id === currentId ? 'bg-muted font-medium' : ''
      }`}
    >
      {editingId === s.id ? (
        <input
          autoFocus
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={() => handleRename(s.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename(s.id);
            if (e.key === 'Escape') setEditingId(null);
          }}
          className="flex-1 bg-transparent outline-none border-b border-border"
        />
      ) : (
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
          <ContextMenuItem
              onSelect={() => {
                const title = window.prompt('新名字', s.title);
                if (title && title.trim()) {
                  fetch('/api/sessions', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: s.id, title: title.trim() }),
                  }).then(() => load());
                }
              }}
            >
              改名
            </ContextMenuItem>
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(s.id)}
            >
              删除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </div>
  );

  if (sessions.length === 0) {
    return <div className="px-2 py-4 text-sm text-muted-foreground">还没有对话</div>;
  }

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {loose.map(renderItem)}

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
