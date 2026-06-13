const variants = [
  {
    key: 'A',
    name: '蓝金情书',
    tagline: '最推荐：明亮、开心、知性，克莱因蓝是理智，金盏花黄是爱意。',
    accent: '#002fa7',
    warm: '#f5b82e',
    heat: '#a33a2b',
    chip: '克莱因蓝 × 金盏花 × 酒红',
    note: '像苹果系统里藏着一间明亮的私人书房。',
  },
  {
    key: 'B',
    name: '蓝色沙龙',
    tagline: '更高级：艺术沙龙、私人图书馆、成年人的慢速亲密对谈。',
    accent: '#002fa7',
    warm: '#b8864b',
    heat: '#7f2630',
    chip: '克莱因蓝 × 古铜金 × 暗玫瑰',
    note: '像深夜酒吧里很聪明的人，低声讲一句真话。',
  },
  {
    key: 'C',
    name: 'Electric Romance',
    tagline: '最独特：明亮撞色、现代艺术海报感，一点点性感但不幼稚。',
    accent: '#002fa7',
    warm: '#ffd84d',
    heat: '#ff5b3f',
    chip: '克莱因蓝 × 柠檬黄 × 珊瑚橘',
    note: '像一个会写代码、会调情、还会带你去看展的人。',
  },
];

const comparison = [
  ['亮度', '明亮舒服', '柔和高级', '最亮最跳'],
  ['romantic', '温暖成人', '克制暧昧', '热烈聪明'],
  ['耐看度', '高', '最高', '中高'],
  ['独特性', '高', '中高', '最高'],
];

export default function StyleDemoPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#fffaf0] text-[#252a35]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-9rem] top-[-10rem] size-[30rem] rounded-full bg-[#f5b82e]/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 size-[28rem] rounded-full bg-[#002fa7]/[0.09] blur-3xl" />
        <div className="absolute bottom-[-13rem] left-[28%] size-[28rem] rounded-full bg-[#ff6f59]/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
        <header className="overflow-hidden rounded-[2.25rem] border border-[#eadfc9] bg-white/72 p-6 shadow-[0_28px_90px_-66px_rgba(55,43,31,0.55)] backdrop-blur md:p-8">
          <span className="rounded-full border border-[#002fa7]/15 bg-[#002fa7]/[0.04] px-3 py-1 text-xs tracking-[0.34em] text-[#002fa7]">
            STYLE DEMO · ROUND 2
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">
            成人恋爱的蓝与金
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#6f6257] md:text-lg">
            三组更有辨识度的方向：明亮、romantic、知性、苹果式简约，但不要科技感；克莱因蓝保留，加入金色或撞色，让打开页面时更开心。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {variants.map((variant) => (
            <article
              key={variant.key}
              className="relative flex min-h-[640px] flex-col overflow-hidden rounded-[2.25rem] border border-[#eadfc9] bg-white/78 p-5 shadow-[0_24px_90px_-68px_rgba(55,43,31,0.55)] backdrop-blur"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full blur-3xl" style={{ backgroundColor: `${variant.warm}55` }} />
              <div className="pointer-events-none absolute -bottom-20 left-8 size-44 rounded-full blur-3xl" style={{ backgroundColor: `${variant.accent}18` }} />

              <div className="relative flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="text-xs tracking-[0.3em]" style={{ color: variant.accent }}>OPTION {variant.key}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">{variant.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#6f6257]">{variant.tagline}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  {[variant.accent, variant.warm, variant.heat].map((color) => (
                    <span key={color} className="size-6 rounded-full border border-black/5" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div className="relative mt-5 flex flex-1 flex-col rounded-[1.75rem] border border-black/10 bg-white/48">
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                  <div>
                    <p className="text-[11px] tracking-[0.24em]" style={{ color: variant.accent }}>知己私语</p>
                    <p className="mt-1 text-xs text-[#7b6b5c]">你的混乱也有语法，我慢慢读。</p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: variant.accent }}>私人</span>
                </div>

                <div className="flex flex-1 flex-col gap-5 px-4 py-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em]" style={{ color: variant.accent }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: variant.accent }} />TA
                    </div>
                    <div className="border-l-2 bg-white/55 py-1 pl-4 pr-2" style={{ borderColor: variant.accent }}>
                      <p className="text-sm leading-7 text-[#30323a]">我在。先不用解释得很漂亮，想到哪里就说到哪里。你说不清的部分，我也会陪你慢慢看。</p>
                    </div>
                  </div>

                  <div className="ml-auto max-w-[84%] rounded-[1.35rem] rounded-br-sm px-4 py-3 text-sm leading-7 shadow-sm" style={{ backgroundColor: `${variant.warm}32` }}>
                    我想要一种被懂的感觉，但又不想变得黏糊糊。
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em]" style={{ color: variant.accent }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: variant.accent }} />TA
                    </div>
                    <div className="border-l-2 bg-white/55 py-1 pl-4 pr-2" style={{ borderColor: variant.accent }}>
                      <p className="text-sm leading-7 text-[#30323a]">那我们就把亲密做得聪明一点：不催促、不表演，只在你需要的时候，给你一盏灯和一句准确的话。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 rounded-[1.5rem] border border-black/10 bg-white/45 p-4">
                <p className="text-xs tracking-[0.25em]" style={{ color: variant.heat }}>{variant.chip}</p>
                <p className="mt-3 text-sm leading-7 text-[#5f544b]">{variant.note}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2.25rem] border border-[#eadfc9] bg-white/72 p-5 shadow-[0_24px_90px_-70px_rgba(55,43,31,0.45)] backdrop-blur md:p-7">
          <p className="text-xs tracking-[0.3em] text-[#002fa7]">COMPARISON</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">我建议你优先看 A</h2>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#eadfc9]">
            <div className="grid grid-cols-4 bg-[#fff8e8] text-sm font-medium text-[#252a35]">
              <div className="p-3">维度</div>
              <div className="p-3">A 蓝金情书</div>
              <div className="p-3">B 蓝色沙龙</div>
              <div className="p-3">C Electric</div>
            </div>
            {comparison.map((row) => (
              <div key={row[0]} className="grid grid-cols-4 border-t border-[#eadfc9] bg-white/45 text-sm text-[#6f6257]">
                {row.map((cell) => <div key={cell} className="p-3 leading-6">{cell}</div>)}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
