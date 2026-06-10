'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Session = {
  id: string;
  title: string;
  updated_at: string;
};

export function SidebarHistory() {
  const router = useRouter();
  const params = useParams();
  const currentId = (params?.id as string) || '';
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

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
    if (id === currentId) {
      router.push('/');
    }
    load();
  };

  if (sessions.length === 0) {
    return (
      <div className="px-2 py-4 text-sm text-muted-foreground">
        还没有对话
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {sessions.map((s) => (
        <div
          key={s.id}
          className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer ${
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
            <span
              className="flex-1 truncate"
              onClick={() => router.push(`/chat/${s.id}`)}
            >
              {s.title}
            </span>
          )}

          <div className="hidden group-hover:flex gap-1 ml-2">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(s.id);
                setEditingTitle(s.title);
              }}
            >
              改名
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(s.id);
              }}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
