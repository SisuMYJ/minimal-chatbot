import { models as presetModels } from '@/lib/ai/models';

// 你最常用的，置顶显示。顺序就是这里的顺序。
const PRESET_IDS = presetModels.map((m) => m.apiIdentifier);

export async function GET() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      // 缓存 1 小时，别每次开页面都重拉
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // 拉失败就退回你的 preset，至少下拉不空
      return Response.json({ models: presetModels, source: 'preset-fallback' });
    }

    const data = await res.json();

    // OpenRouter 返回 { data: [ { id, name, description, ... }, ... ] }
    const all = (data.data ?? []).map((m: any) => ({
      apiIdentifier: m.id,
      label: m.name ?? m.id,
      description: '',
    }));

    // 把 preset 命中的挑出来置顶（保留你写的中文 label/description）
    const presetSet = new Set(PRESET_IDS);
    const top = presetModels.map((p) => ({
      apiIdentifier: p.apiIdentifier,
      label: `★ ${p.label}`,
      description: p.description,
    }));
    const rest = all.filter((m: any) => !presetSet.has(m.apiIdentifier));

    return Response.json({ models: [...top, ...rest], source: 'live' });
  } catch {
    return Response.json({ models: presetModels, source: 'preset-fallback' });
  }
}
