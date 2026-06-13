'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Blessing = { id: number; content: string; pinned: boolean };

export const Overview = () => {
  const [blessing, setBlessing] = useState<Blessing | null>(null);
  const [all, setAll] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);

  const pickRandom = (list: Blessing[]) => {
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  };

  const load = async () => {
    try {
      const res = await fetch('/api/favorite-message');
      const data = await res.json();
      if (data.ok) {
        if (data.blessing) {
          // 有固定的
          setBlessing(data.blessing);
          setAll([]);
        } else if (data.all && data.all.length > 0) {
          setAll(data.all);
          setBlessing(pickRandom(data.all));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shuffle = () => {
    if (all.length > 0) setBlessing(pickRandom(all));
  };

  const togglePin = async () => {
    if (!blessing) return;
    const newPinned = !blessing.pinned;
    await fetch('/api/favorite-message', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: blessing.id, pinned: newPinned }),
    });
    setBlessing({ ...blessing, pinned: newPinned });
    load();
  };

  return (
    <motion.div
      key="overview"
      className="mx-auto max-w-3xl px-4 md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative flex max-w-xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-white/70 bg-card/72 p-8 text-center shadow-[0_28px_80px_-48px_hsl(243_100%_39%/0.7)] backdrop-blur-xl dark:border-white/10">
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-10 size-28 rounded-full bg-rose-200/40 blur-2xl dark:bg-rose-500/10" />
        <div className="relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          ♥
        </div>
        {loading ? (
          <p className="relative text-muted-foreground">…</p>
        ) : blessing ? (
          <>
            <p className="relative whitespace-pre-wrap text-lg leading-relaxed">
              {blessing.content}
            </p>
            <div className="relative flex gap-4 text-xs text-muted-foreground">
              {!blessing.pinned && all.length > 1 && (
                <button onClick={shuffle} className="hover:text-foreground">换一句</button>
              )}
              <button onClick={togglePin} className="hover:text-foreground">
                {blessing.pinned ? '取消固定（恢复随机）' : '固定这句'}
              </button>
            </div>
          </>
        ) : (
          <p className="relative leading-relaxed text-muted-foreground">
            把喜欢的话收藏起来吧。以后打开这里，会先递给你一句温柔的回声。
          </p>
        )}
      </div>
    </motion.div>
  );
};
