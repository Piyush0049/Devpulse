import { InferenceClient } from "@huggingface/inference";

const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const GENERATION_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

function getClient(): InferenceClient {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key || key.includes("your_key")) {
    throw new Error("HUGGINGFACE_API_KEY is not set in .env.local");
  }
  return new InferenceClient(key);
}

function bearerHeaders() {
  const key = process.env.HUGGINGFACE_API_KEY!;
  return {
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function embedText(text: string): Promise<number[]> {
  try {
    const client = getClient();
    const response = await client.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text.slice(0, 512),
    });
    // response is number[] or number[][]
    if (Array.isArray(response) && Array.isArray(response[0])) {
      return response[0] as number[];
    }
    return response as number[];
  } catch (error) {
    console.error("Embedding error:", error);
    return new Array(384).fill(0);
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await embedText(text));
    await new Promise((r) => setTimeout(r, 100));
  }
  return results;
}

export async function generateInsight(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 300
): Promise<string> {
  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        model: GENERATION_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Chat API ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "Unable to generate response.";
  } catch (error) {
    console.error("Generation error:", error);
    return "Unable to generate response. Please check your HuggingFace API key.";
  }
}

export async function generateText(prompt: string, maxTokens = 512): Promise<string> {
  return generateInsight("You are a helpful AI assistant.", prompt, maxTokens);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}
