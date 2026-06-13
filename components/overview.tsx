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
      className="max-w-3xl mx-auto md:mt-20 px-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.3 }}
    >
      <div className="rounded-[1.9rem] border border-border/70 bg-card/78 p-8 flex flex-col gap-6 items-center text-center max-w-xl shadow-[0_24px_70px_-52px_rgba(55,43,31,0.55)] backdrop-blur-xl">
        {loading ? (
          <p className="text-muted-foreground">…</p>
        ) : blessing ? (
          <>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {blessing.content}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              {!blessing.pinned && all.length > 1 && (
                <button onClick={shuffle} className="hover:text-foreground">换一句</button>
              )}
              <button onClick={togglePin} className="hover:text-foreground">
                {blessing.pinned ? '取消固定（恢复随机）' : '固定这句'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground leading-relaxed">
            右键收藏喜欢的话，这里会随机给你一句。
          </p>
        )}
      </div>
    </motion.div>
  );
};
