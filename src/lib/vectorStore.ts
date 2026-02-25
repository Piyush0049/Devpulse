import type { VectorEntry, FileEntry } from "@/types";
import { embedText, cosineSimilarity } from "./embeddings";

const CHUNK_SIZE = 800; // chars per chunk

export function chunkFile(file: FileEntry): Array<{ text: string; startLine: number }> {
  const lines = file.content.split("\n");
  const chunks: Array<{ text: string; startLine: number }> = [];
  let currentChunk: string[] = [];
  let startLine = 1;
  let charCount = 0;

  for (let i = 0; i < lines.length; i++) {
    currentChunk.push(lines[i]);
    charCount += lines[i].length + 1;

    if (charCount >= CHUNK_SIZE) {
      const text = `File: ${file.path}\n\n${currentChunk.join("\n")}`;
      chunks.push({ text, startLine });

      // Overlap: keep last few lines
      const overlapLines = currentChunk.slice(-3);
      startLine = i + 1 - overlapLines.length + 1;
      currentChunk = overlapLines;
      charCount = overlapLines.join("\n").length;
    }
  }

  if (currentChunk.length > 0) {
    const text = `File: ${file.path}\n\n${currentChunk.join("\n")}`;
    chunks.push({ text, startLine });
  }

  return chunks;
}

export function buildVectorEntries(
  file: FileEntry,
  embeddings: number[][],
  chunks: Array<{ text: string }>
): VectorEntry[] {
  return chunks.map((chunk, i) => ({
    id: `${file.path}::chunk-${i}`,
    text: chunk.text,
    embedding: embeddings[i],
    metadata: {
      path: file.path,
      type: "chunk",
      repo: "",
      language: file.language,
      lines: file.lines,
      size: file.size,
    },
  }));
}

export async function searchVectors(
  query: string,
  vectors: VectorEntry[],
  topK = 5
): Promise<Array<VectorEntry & { score: number }>> {
  if (vectors.length === 0) return [];

  // Discard any zero-vector entries (produced when embeddings failed during indexing)
  const validVectors = vectors.filter((v) => v.embedding && !v.embedding.every((x) => x === 0));
  if (validVectors.length === 0) return [];

  const queryEmbedding = await embedText(query);
  if (queryEmbedding.every((v) => v === 0)) return [];

  const scored = validVectors.map((v) => ({
    ...v,
    score: cosineSimilarity(queryEmbedding, v.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((v) => v.score > 0.1);
}
