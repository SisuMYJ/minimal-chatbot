'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function BalancePage() {
  const router = useRouter();
  const [data, setData] = useState<{ total: number; used: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/balance');
      const d = await res.json();
      if (d.ok) {
        setData({ total: d.total, used: d.used, remaining: d.remaining });
      } else {
        setError('查询失败');
      }
    } catch (e) {
      setError('查询失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-background overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">余量</h1>
          <Button variant="ghost" onClick={() => router.push('/')}>
            返回对话
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          想看的时候点一下查询，平时不显示。
        </p>

        <Button onClick={check} disabled={loading}>
          {loading ? '查询中…' : '查询余量'}
        </Button>

        {error && <span className="text-sm text-destructive">{error}</span>}

        {data && (
          <div className="rounded-lg border border-border p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">充值总额</span>
              <span>${data.total.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">已用</span>
              <span>${data.used.toFixed(4)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>剩余</span>
              <span>${data.remaining.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
