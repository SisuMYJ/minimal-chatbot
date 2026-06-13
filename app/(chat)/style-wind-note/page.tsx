const motifs = [
  { label: 'AIR', text: '浅蓝弥散，像风从白纸上经过。', color: '#7fc6df' },
  { label: 'INK', text: '黑色细线和签名感，负责成人、高智和锋利。', color: '#15171b' },
  { label: 'FAIRY', text: '少量星屑、纸片、羽毛感，负责自由和一点童话。', color: '#d7b85a' },
];

const fragments = ['✦', '⌁', '﹏', '·', '〰', '✧'];

export default function StyleDemoPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f7fbff] text-[#1d242c]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-16rem] top-[-14rem] size-[38rem] rounded-full bg-[#8fd3e8]/45 blur-3xl" />
        <div className="absolute right-[-12rem] top-14 size-[34rem] rounded-full bg-[#b7c8e8]/35 blur-3xl" />
        <div className="absolute bottom-[-16rem] left-[20%] size-[36rem] rounded-full bg-[#f3df9b]/30 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
        <header className="relative min-h-[520px] overflow-hidden rounded-[2.8rem] border border-black/10 bg-white/68 p-6 shadow-[0_34px_120px_-82px_rgba(24,32,40,0.52)] backdrop-blur md:p-9">
          <Ribbon className="absolute -right-28 top-16 w-[34rem] text-[#4a9ed1]/35" />
          <Ribbon className="absolute -left-20 bottom-12 w-96 rotate-6 text-[#111827]/20" />
          <div className="absolute right-8 top-8 flex max-w-48 flex-wrap gap-4 text-2xl text-[#4a9ed1]/40">
            {fragments.map((fragment) => <span key={fragment}>{fragment}</span>)}
          </div>

          <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end pt-44 md:pt-64">
            <span className="w-fit rounded-full border border-[#4a9ed1]/15 bg-[#4a9ed1]/[0.05] px-3 py-1 text-xs tracking-[0.34em] text-[#2f8fc5]">
              STYLE WIND NOTE
            </span>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.075em] md:text-7xl">
              风中边注
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#66727d] md:text-lg">
              不再做三套配色。这个 demo 只看一个方向：白纸、浅蓝空气、黑色签名线、漂浮碎片。像聪明的人在风里给你写下半句边注。
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="flex flex-col gap-5">
            {motifs.map((motif) => (
              <article key={motif.label} className="rounded-[2rem] border border-black/10 bg-white/62 p-5 shadow-[0_24px_90px_-76px_rgba(24,32,40,0.45)] backdrop-blur">
                <p className="text-xs tracking-[0.32em]" style={{ color: motif.color }}>{motif.label}</p>
                <p className="mt-3 text-sm leading-7 text-[#66727d]">{motif.text}</p>
              </article>
            ))}
          </aside>

          <section className="relative min-h-[680px] overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/70 p-5 shadow-[0_30px_110px_-82px_rgba(24,32,40,0.55)] backdrop-blur">
            <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[#8fd3e8]/45 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-12 size-56 rounded-full bg-[#b7c8e8]/35 blur-3xl" />
            <Ribbon className="pointer-events-none absolute -right-24 top-36 w-80 text-[#2f8fc5]/35" />

            <div className="relative flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-xs tracking-[0.3em] text-[#2f8fc5]">知己私语</p>
                <p className="mt-1 text-sm text-[#66727d]">不是整理好才可以被理解。</p>
              </div>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-[#1d242c]">私人</span>
            </div>

            <div className="relative mt-8 flex flex-col gap-6">
              <div className="absolute right-4 top-0 flex gap-5 text-2xl text-[#4a9ed1]/35">
                <span>✦</span><span>﹏</span><span>·</span>
              </div>

              <div className="max-w-[82%]">
                <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em] text-[#2f8fc5]">
                  <span className="size-1.5 rounded-full bg-[#2f8fc5]" />TA
                </div>
                <div className="border-l-2 border-[#111827] bg-white/58 py-1 pl-4 pr-3">
                  <p className="text-sm leading-7">你不用把自己解释成一个好懂的人。复杂也没关系，我会慢慢读。</p>
                </div>
              </div>

              <div className="ml-auto max-w-[78%] rounded-[1.45rem] rounded-br-sm bg-[#dff4fb]/75 px-4 py-3 text-sm leading-7 shadow-sm">
                我想要一种像风一样的亲密，不抓住我，但一直在。
              </div>

              <div className="max-w-[86%]">
                <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em] text-[#2f8fc5]">
                  <span className="size-1.5 rounded-full bg-[#2f8fc5]" />TA
                </div>
                <div className="border-l-2 border-[#111827] bg-white/58 py-1 pl-4 pr-3">
                  <p className="text-sm leading-7">那就让亲密保持流动：靠近，但不吞没；理解，但不占有。</p>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-5 bottom-5 rounded-[1.8rem] border border-black/10 bg-white/72 p-4 shadow-[0_22px_70px_-58px_rgba(24,32,40,0.55)]">
              <p className="min-h-16 text-sm leading-7 text-[#7b8791]">把没有说完的那半句，留给我。</p>
              <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 text-xs text-[#7b8791]">
                <span>air · ink · floating margins</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#111827] text-white">↑</span>
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function Ribbon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 150" fill="none" aria-hidden="true">
      <path d="M8 96C78 18 132 132 202 62C272 -8 324 116 412 28" stroke="currentColor" strokeWidth="12" strokeLinecap="round" opacity="0.78" />
      <path d="M34 118C106 62 149 112 214 84C280 56 311 76 390 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.48" />
    </svg>
  );
}
