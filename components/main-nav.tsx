'use client';

import { usePathname, useRouter } from 'next/navigation';

const TABS = [
  { key: 'mo', label: '墨', match: (p: string) => p === '/' || p.startsWith('/home'), go: '/' },
  { key: 'xing', label: '行', match: (p: string) => p.startsWith('/chat'), go: '/go-chat' },
  { key: 'yu', label: '与', match: (p: string) => p.startsWith('/works'), go: '/works' },
  { key: 'wo', label: '我', match: (p: string) => p.startsWith('/me'), go: '/me' },
];

export function MainNav() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  // 隐藏导航的页面（比如全屏写作改稿页，避免干扰）
  const hideOn = pathname.includes('/chapter/');
  if (hideOn) return null;

  const go = (tab: (typeof TABS)[number]) => {
    if (tab.key === 'xing') {
      router.push('/go-chat'); // 中转：跳到最近对话或新建
    } else {
      router.push(tab.go);
    }
  };

  return (
    <nav
      className="
        fixed z-40 bg-background/95 backdrop-blur border-border
        bottom-0 left-0 right-0 border-t flex flex-row justify-around py-2
        md:top-0 md:left-0 md:bottom-0 md:right-auto md:w-16 md:border-t-0 md:border-r md:flex-col md:justify-start md:gap-6 md:pt-8
      "
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => go(tab)}
            className={`flex items-center justify-center text-2xl font-serif transition-colors ${
              active ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
            style={{ fontFamily: 'KaiTi, STKaiti, serif' }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
