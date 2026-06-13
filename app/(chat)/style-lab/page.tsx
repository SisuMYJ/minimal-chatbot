const variants = [
  {
    key: 'A',
    name: '瓷白朱砂',
    tagline: '最推荐：干净、克制、成人，像白纸上一枚准确的红色批注。',
    bg: '#f8f5ef',
    panel: '#fffdf8',
    text: '#222222',
    muted: '#71685f',
    accent: '#b13a2f',
    quiet: '#14213d',
    soft: '#ebc7ad',
    note: '简约但有心跳，适合做最终成品的主方向。',
  },
  {
    key: 'B',
    name: '青瓷夜航',
    tagline: '更文气：清冷、安静、高级，像雨后书房里一盏低亮度的灯。',
    bg: '#f7f2ea',
    panel: '#fbfaf5',
    text: '#263b35',
    muted: '#6d7a71',
    accent: '#8e3f4b',
    quiet: '#2454a6',
    soft: '#dde8df',
    note: '不甜、不俗，有一点冷，但很会陪伴。',
  },
  {
    key: 'C',
    name: '奶油茄紫',
    tagline: '最 hot nerd：奶油底、茄紫暗流、黄油光，聪明但有一点危险。',
    bg: '#fff7ea',
    panel: '#fffcf5',
    text: '#27262c',
    muted: '#786a62',
    accent: '#3b2545',
    quiet: '#a45c52',
    soft: '#f6c85f',
    note: '更特别、更有个性，但需要克制使用。',
  },
];

const comparison = [
  ['气质', '克制心跳', '清冷文气', '聪明微热'],
  ['亮度', '明亮瓷白', '柔亮青瓷', '温暖奶油'],
  ['romantic', '成人、准确', '含蓄、深水', '暧昧、怪趣'],
  ['风险', '最稳', '偏冷', '最挑人'],
];

export default function StyleDemoPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f8f5ef] text-[#222222]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] size-[32rem] rounded-full bg-[#ebc7ad]/35 blur-3xl" />
        <div className="absolute right-[-10rem] top-12 size-[30rem] rounded-full bg-[#b13a2f]/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-[32%] size-[30rem] rounded-full bg-[#dde8df]/60 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
        <header className="overflow-hidden rounded-[2.4rem] border border-black/10 bg-white/62 p-6 shadow-[0_30px_100px_-74px_rgba(35,28,22,0.58)] backdrop-blur md:p-8">
          <span className="rounded-full border border-[#b13a2f]/15 bg-[#b13a2f]/[0.04] px-3 py-1 text-xs tracking-[0.34em] text-[#b13a2f]">
            STYLE LAB · NEW MOOD
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] md:text-6xl">
            不再锁死蓝色，先找你的心跳
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#71685f] md:text-lg">
            这轮不做蓝金网站感，改看三种更成人、更有记忆点的情绪：瓷白朱砂、青瓷夜航、奶油茄紫。最后成品仍然只改原有页面的美术，不新增功能。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {variants.map((variant) => (
            <article
              key={variant.key}
              className="relative flex min-h-[660px] flex-col overflow-hidden rounded-[2.35rem] border border-black/10 p-5 shadow-[0_26px_96px_-72px_rgba(35,28,22,0.58)] backdrop-blur"
              style={{ backgroundColor: `${variant.panel}cc`, color: variant.text }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full blur-3xl" style={{ backgroundColor: `${variant.soft}88` }} />
              <div className="pointer-events-none absolute -bottom-20 left-8 size-44 rounded-full blur-3xl" style={{ backgroundColor: `${variant.accent}22` }} />

              <div className="relative flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="text-xs tracking-[0.3em]" style={{ color: variant.accent }}>OPTION {variant.key}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{variant.name}</h2>
                  <p className="mt-3 text-sm leading-7" style={{ color: variant.muted }}>{variant.tagline}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  {[variant.accent, variant.quiet, variant.soft].map((color) => (
                    <span key={color} className="size-6 rounded-full border border-black/5" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <div className="relative mt-5 flex flex-1 flex-col rounded-[1.8rem] border border-black/10 bg-white/42">
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                  <div>
                    <p className="text-[11px] tracking-[0.24em]" style={{ color: variant.accent }}>知己私语</p>
                    <p className="mt-1 text-xs" style={{ color: variant.muted }}>把没有说完的那半句，留给我。</p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: variant.accent }}>私人</span>
                </div>

                <div className="flex flex-1 flex-col gap-5 px-4 py-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em]" style={{ color: variant.accent }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: variant.accent }} />TA
                    </div>
                    <div className="border-l-2 bg-white/55 py-1 pl-4 pr-2" style={{ borderColor: variant.accent }}>
                      <p className="text-sm leading-7">你不用把自己解释成一个好懂的人。复杂也没关系，我会慢慢读。</p>
                    </div>
                  </div>

                  <div className="ml-auto max-w-[84%] rounded-[1.35rem] rounded-br-sm px-4 py-3 text-sm leading-7 shadow-sm" style={{ backgroundColor: `${variant.soft}66` }}>
                    我想要一种很亲密，但又不失去自己的感觉。
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.22em]" style={{ color: variant.accent }}>
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: variant.accent }} />TA
                    </div>
                    <div className="border-l-2 bg-white/55 py-1 pl-4 pr-2" style={{ borderColor: variant.accent }}>
                      <p className="text-sm leading-7">那就让亲密保持一点距离感：靠近，但不吞没；理解，但不占有。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 rounded-[1.55rem] border border-black/10 bg-white/38 p-4">
                <p className="text-xs tracking-[0.25em]" style={{ color: variant.accent }}>{variant.name}</p>
                <p className="mt-3 text-sm leading-7" style={{ color: variant.muted }}>{variant.note}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2.3rem] border border-black/10 bg-white/62 p-5 shadow-[0_26px_96px_-74px_rgba(35,28,22,0.48)] backdrop-blur md:p-7">
          <p className="text-xs tracking-[0.3em] text-[#b13a2f]">COMPARISON</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">我现在更建议你优先看 A</h2>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/10">
            <div className="grid grid-cols-4 bg-[#f4eadf] text-sm font-medium text-[#222222]">
              <div className="p-3">维度</div>
              <div className="p-3">A 瓷白朱砂</div>
              <div className="p-3">B 青瓷夜航</div>
              <div className="p-3">C 奶油茄紫</div>
            </div>
            {comparison.map((row) => (
              <div key={row[0]} className="grid grid-cols-4 border-t border-black/10 bg-white/38 text-sm text-[#71685f]">
                {row.map((cell) => <div key={cell} className="p-3 leading-6">{cell}</div>)}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
