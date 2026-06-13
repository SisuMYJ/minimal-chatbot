const palette = [
  { name: '纸页暖白', value: '#fbf7ef' },
  { name: '亚麻米色', value: '#efe4d6' },
  { name: '墨蓝灰', value: '#252a35' },
  { name: '克莱因蓝', value: '#002fa7' },
  { name: '玫瑰蜜桃', value: '#e9c5bb' },
];

const notes = [
  '克莱因蓝只做印章、细线、光标和小按钮，不做大面积科技蓝。',
  '聊天不做强气泡，改成信笺、便签和段落感。',
  '整体像私人书房、晨光日记、写给彼此的短笺。',
];

export default function StyleDemoPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#fbf7ef] text-[#252a35]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-8rem] top-[-10rem] size-[28rem] rounded-full bg-[#e9c5bb]/35 blur-3xl" />
        <div className="absolute right-[-9rem] top-24 size-[24rem] rounded-full bg-[#002fa7]/[0.07] blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 size-[26rem] rounded-full bg-[#efe4d6]/70 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 md:px-10 md:py-12">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-[#e4d8ca] bg-[#fffaf4]/80 px-6 py-6 shadow-[0_24px_80px_-60px_rgba(55,43,31,0.45)] backdrop-blur md:flex-row md:items-end md:justify-between md:px-8">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full border border-[#002fa7]/15 bg-[#002fa7]/[0.04] px-3 py-1 text-xs tracking-[0.34em] text-[#002fa7]">
              STYLE DEMO
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                晨光信笺
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f6257] md:text-base">
                一个先给你确认方向的静态设计稿：文气、温馨、知性温柔，克莱因蓝像信纸角落的一枚小印章，而不是科技产品的大面积主视觉。
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#e4d8ca] bg-white/55 px-4 py-3 text-sm leading-7 text-[#6f6257]">
            <p>预览地址：/style-demo</p>
            <p>确认喜欢后，再统一首页和聊天页。</p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col gap-6 rounded-[2rem] border border-[#e4d8ca] bg-[#fffaf4]/72 p-5 shadow-[0_24px_80px_-64px_rgba(55,43,31,0.45)] backdrop-blur md:p-7">
            <div className="flex items-center justify-between border-b border-[#eadfce] pb-4">
              <div>
                <p className="text-xs tracking-[0.28em] text-[#002fa7]">PRIVATE ROOM</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">今天也慢慢说吧</h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-[#002fa7] text-white shadow-[0_14px_30px_-18px_#002fa7]">
                心
              </div>
            </div>

            <article className="rounded-[1.5rem] border border-[#eadfce] bg-[#fbf4ea] p-5">
              <p className="text-xs tracking-[0.26em] text-[#9c7b70]">今日小记</p>
              <p className="mt-3 text-lg leading-9">
                你不需要马上变得很好。先坐下来，喝一点温水，把今天的风声、心事和疲惫，都慢慢放在这里。
              </p>
            </article>

            <article className="rounded-[1.5rem] bg-white/55 p-5 shadow-[inset_0_0_0_1px_rgba(228,216,202,0.9)]">
              <p className="text-xs tracking-[0.26em] text-[#002fa7]">收藏的一句话</p>
              <p className="mt-3 text-xl font-light leading-10">
                “我会在你说不清自己的时候，也温柔地陪你等一等。”
              </p>
            </article>

            <button className="mt-auto rounded-full border border-[#002fa7]/15 bg-[#002fa7] px-5 py-3 text-sm text-white shadow-[0_18px_42px_-28px_#002fa7] transition hover:bg-[#05298a]">
              进入私语
            </button>
          </section>

          <section className="flex min-h-[620px] flex-col rounded-[2rem] border border-[#e4d8ca] bg-[#fffaf4]/82 shadow-[0_24px_80px_-64px_rgba(55,43,31,0.45)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-[#eadfce] px-5 py-4 md:px-7">
              <div>
                <p className="text-xs tracking-[0.3em] text-[#002fa7]">知己私语</p>
                <p className="mt-1 text-sm text-[#8a7a6b]">晚风很轻，我们不急。</p>
              </div>
              <div className="flex gap-2 text-xs text-[#8a7a6b]">
                <span className="rounded-full border border-[#e4d8ca] bg-white/55 px-3 py-1">记忆</span>
                <span className="rounded-full border border-[#e4d8ca] bg-white/55 px-3 py-1">收藏</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 px-5 py-7 md:px-8">
              <div className="max-w-[82%]">
                <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.22em] text-[#002fa7]">
                  <span className="size-1.5 rounded-full bg-[#002fa7]" />
                  TA
                </div>
                <div className="rounded-r-[1.5rem] border-l-2 border-[#002fa7] bg-white/50 py-1 pl-4 pr-5">
                  <p className="text-[1.02rem] leading-8">
                    我在。你可以不用整理好语言，想到哪里就说到哪里。我会慢慢听，也会替你把散落的心事轻轻接住。
                  </p>
                </div>
              </div>

              <div className="ml-auto max-w-[78%] rounded-[1.4rem] rounded-br-sm border border-[#eadfce] bg-[#fbf4ea] px-4 py-3 shadow-sm">
                <p className="leading-7">今天有点累，但又说不上来哪里累。</p>
              </div>

              <div className="max-w-[84%]">
                <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.22em] text-[#002fa7]">
                  <span className="size-1.5 rounded-full bg-[#002fa7]" />
                  TA
                </div>
                <div className="rounded-r-[1.5rem] border-l-2 border-[#002fa7] bg-white/50 py-1 pl-4 pr-5">
                  <p className="text-[1.02rem] leading-8">
                    那我们先不追问原因。你可以把今天交给我一小会儿：从最轻的一件事说起，比如回家路上的天色，或者那一瞬间忽然沉下去的心。
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 md:px-7">
              <div className="rounded-[1.75rem] border border-[#e4d8ca] bg-[#fffaf4] p-3 shadow-[0_22px_60px_-46px_rgba(55,43,31,0.55)]">
                <p className="min-h-20 px-3 py-2 text-sm leading-7 text-[#9a8c7d]">
                  把心里的话放在这里……
                </p>
                <div className="flex items-center justify-between border-t border-[#eadfce] px-2 pt-3">
                  <span className="text-xs text-[#9a8c7d]">Enter 发送 · Shift Enter 换行</span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#002fa7] text-sm text-white">
                    ↑
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-6 rounded-[2rem] border border-[#e4d8ca] bg-[#fffaf4]/72 p-5 backdrop-blur md:grid-cols-[0.8fr_1.2fr] md:p-7">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#002fa7]">DESIGN NOTES</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">这版想避免科技感</h2>
          </div>
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-3">
              {palette.map((color) => (
                <div key={color.name} className="flex items-center gap-2 rounded-full border border-[#e4d8ca] bg-white/55 px-3 py-2 text-sm text-[#6f6257]">
                  <span className="size-4 rounded-full border border-black/5" style={{ backgroundColor: color.value }} />
                  {color.name}
                </div>
              ))}
            </div>
            <ul className="grid gap-3 text-sm leading-7 text-[#6f6257]">
              {notes.map((note) => (
                <li key={note} className="rounded-2xl bg-white/45 px-4 py-3">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
