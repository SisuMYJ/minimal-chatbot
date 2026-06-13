const variants = [
  {
    key: 'A',
    name: '风中边注',
    tagline: '最推荐：白纸、浅蓝空气、黑色细线，像风把一句聪明的亲密话吹到页边。',
    bg: '#f7fbfb',
    panel: '#ffffff',
    text: '#1f252b',
    muted: '#68747a',
    accent: '#2f8fc5',
    line: '#111827',
    soft: '#a9d8e8',
    glow: '#d7edf3',
    mark: '白纸 × 浅蓝空气 × 黑色边注',
  },
  {
    key: 'B',
    name: '墨色飘带',
    tagline: '更 adult：黑西装、签名线、冷白背景，克制、高智、有一点危险。',
    bg: '#f6f7f6',
    panel: '#fbfcfb',
    text: '#151515',
    muted: '#6d6d68',
    accent: '#151515',
    line: '#6f7f90',
    soft: '#dfe7ea',
    glow: '#ece8df',
    mark: '冷白 × 墨黑 × 签名飘带',
  },
  {
    key: 'C',
    name: '天空画室',
    tagline: '更灵动：天空蓝、纸片、星屑、童话感，但保留成年人的留白和克制。',
    bg: '#f7fbff',
    panel: '#ffffff',
    text: '#27313f',
    muted: '#6b7588',
    accent: '#5aaed3',
    line: '#d8aa4f',
    soft: '#b9c8ec',
    glow: '#dff4fb',
    mark: '天空蓝 × 星屑金 × 漂浮纸片',
  },
];

const comparison = [
  ['空间感', '风与边注', '冷白黑线', '天空画纸'],
  ['成人感', '聪明温柔', '最高', '轻一点'],
  ['自由度', '高', '中', '最高'],
  ['风险', '最均衡', '可能偏冷', '可能偏梦'],
];

const floatingMarks = ['⌁', '✦', '﹏', '·', '〰'];

export default function StyleDemoPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f7fbfb] text-[#1f252b]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-14rem] top-[-12rem] size-[34rem] rounded-full bg-[#a9d8e8]/45 blur-3xl" />
        <div className="absolute right-[-12rem] top-12 size-[32rem] rounded-full bg-[#dff4fb]/70 blur-3xl" />
        <div className="absolute bottom-[-15rem] left-[26%] size-[34rem] rounded-full bg-[#b9c8ec]/30 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
        <header className="relative overflow-hidden rounded-[2.6rem] border border-black/10 bg-white/70 p-6 shadow-[0_32px_110px_-78px_rgba(27,35,42,0.5)] backdrop-blur md:p-8">
          <Ribbon className="absolute -right-14 top-8 w-72 text-[#2f8fc5]/30" />
          <span className="rounded-full border border-[#2f8fc5]/15 bg-[#2f8fc5]/[0.04] px-3 py-1 text-xs tracking-[0.34em] text-[#2f8fc5]">
            STYLE LAB · AIRBORNE
          </span>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.065em] md:text-6xl">
            白纸、风、黑线，和一点会飞的童话
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#68747a] md:text-lg">
            这轮不再主要比配色，而是比空气感、线条、悬浮、飘带和精神自由度。最后成品仍然只改原有页面的美术，不新增功能。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {variants.map((variant, index) => (
            <article
              key={variant.key}
              className="relative flex min-h-[690px] flex-col overflow-hidden rounded-[2.45rem] border border-black/10 p-5 shadow-[0_28px_100px_-76px_rgba(27,35,42,0.55)] backdrop-blur"
              style={{ backgroundColor: `${variant.panel}d9`, color: variant.text }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full blur-3xl" style={{ backgroundColor: `${variant.glow}cc` }} />
              <div className="pointer-events-none absolute -bottom-24 left-6 size-48 rounded-full blur-3xl" style={{ backgroundColor: `${variant.soft}80` }} />
              <Ribbon className="pointer-events-none absolute -right-20 top-28 w-64 opacity-40" color={variant.accent} />

              <div className="relative flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="text-xs tracking-[0.3em]" style={{ color: variant.accent }}>OPTION {variant.key}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">{variant.name}</h2>
                  <p className="mt-3 text-sm leading-7" style={{ color: variant.muted }}>{variant.tagline}</p>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-1.5">
                  {[variant.accent, variant.line, variant.soft, variant.glow].map((color) => (
                    <span key={color} className="size-5 rounded-full border border-black/5" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div className="relative mt-5 flex flex-1 flex-col rounded-[1.85rem] border border-black/10 bg-white/46">
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                  <div>
                    <p className="text-[11px] tracking-[0.24em]" style={{ color: variant.accent }}>知己私语</p>
                    <p className="mt-1 text-xs" style={{ color: variant.muted }}>不是整理好才可以被理解。</p>
                  </div>
                  <span className="rounded-full border border-black/10 bg-white/55 px-3 py-1 text-xs" style={{ color: variant.text }}>私人</span>
                </div>

                <div className="relative flex flex-1 flex-col gap-5 px-4 py-5">
                  <div className="pointer-events-none absolute right-5 top-4 flex gap-3 text-lg" style={{ color: `${variant.accent}66` }}>
                    {floatingMarks.slice(index, index + 3).map((mark) => <span key={mark}>{mark}</span>)}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em]" style={{ color: variant.accent }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: variant.accent }} />TA
                    </div>
                    <div className="border-l-2 bg-white/58 py-1 pl-4 pr-2" style={{ borderColor: variant.line }}>
                      <p className="text-sm leading-7">你不用把自己解释成一个好懂的人。复杂也没关系，我会慢慢读。</p>
                    </div>
                  </div>

                  <div className="ml-auto max-w-[84%] rounded-[1.35rem] rounded-br-sm px-4 py-3 text-sm leading-7 shadow-sm" style={{ backgroundColor: `${variant.soft}66` }}>
                    我想要一种像风一样的亲密，不抓住我，但一直在。
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em]" style={{ color: variant.accent }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: variant.accent }} />TA
                    </div>
                    <div className="border-l-2 bg-white/58 py-1 pl-4 pr-2" style={{ borderColor: variant.line }}>
                      <p className="text-sm leading-7">那就让亲密保持流动：靠近，但不吞没；理解，但不占有。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 rounded-[1.55rem] border border-black/10 bg-white/42 p-4">
                <p className="text-xs tracking-[0.25em]" style={{ color: variant.accent }}>{variant.mark}</p>
                <p className="mt-3 text-sm leading-7" style={{ color: variant.muted }}>{variant.key === 'A' ? '最适合做主方向：精神自由，但仍然清醒、简洁、长期耐看。' : variant.key === 'B' ? '适合想要更锋利、更高智、更成人的版本。' : '适合想要更梦、更轻、更童话碎片的版本。'}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2.4rem] border border-black/10 bg-white/68 p-5 shadow-[0_28px_100px_-78px_rgba(27,35,42,0.48)] backdrop-blur md:p-7">
          <p className="text-xs tracking-[0.3em] text-[#2f8fc5]">COMPARISON</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">我现在建议以 A 为底，借 B 的黑线和 C 的碎片</h2>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/10">
            <div className="grid grid-cols-4 bg-[#eef8fb] text-sm font-medium text-[#1f252b]">
              <div className="p-3">维度</div>
              <div className="p-3">A 风中边注</div>
              <div className="p-3">B 墨色飘带</div>
              <div className="p-3">C 天空画室</div>
            </div>
            {comparison.map((row) => (
              <div key={row[0]} className="grid grid-cols-4 border-t border-black/10 bg-white/42 text-sm text-[#68747a]">
                {row.map((cell) => <div key={cell} className="p-3 leading-6">{cell}</div>)}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Ribbon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 120" fill="none" aria-hidden="true">
      <path
        d="M8 79C61 17 110 112 168 54C228 -6 276 97 352 24"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M28 95C89 54 119 93 174 72C225 52 254 65 330 43"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
