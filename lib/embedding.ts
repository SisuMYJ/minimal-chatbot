// 把一段文字转成向量（embedding），走 OpenRouter 调 text-embedding-3-small。
// 模型名抽成常量，将来想换同维度模型只改这一行。
const EMBEDDING_MODEL = "openai/text-embedding-3-small";

export async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Embedding 调用失败 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  // OpenRouter/OpenAI embedding 返回结构：data.data[0].embedding 是那串向量
  const vector = data?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) {
    throw new Error(`Embedding 返回结构异常: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return vector;
}
