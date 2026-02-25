import type { VectorEntry, QueryResult } from "@/types";
import { searchVectors } from "./vectorStore";
import { generateInsight } from "./embeddings";

export async function queryCodebase(
  question: string,
  vectors: VectorEntry[]
): Promise<QueryResult> {
  if (vectors.length === 0) {
    return {
      answer: "No repository indexed yet. Please connect a GitHub repository first.",
      sources: [],
      confidence: 0,
    };
  }

  // Find relevant chunks
  const relevant = await searchVectors(question, vectors, 5);

  if (relevant.length === 0) {
    return {
      answer: "I couldn't find relevant code for your question. Try rephrasing or asking something more specific about the codebase.",
      sources: [],
      confidence: 0.1,
    };
  }

  // Build context from relevant chunks
  const context = relevant
    .map((r) => `### ${r.metadata.path}\n${r.text.substring(r.text.indexOf("\n\n") + 2, 600)}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are DevPulse AI, an expert engineering assistant analyzing a codebase.
Answer questions about the code based on the provided context.
Be specific, mention file paths, and give actionable insights.
Keep answers concise but informative (2-4 sentences).`;

  const userPrompt = `Context from the codebase:
${context}

Question: ${question}

Answer the question based on the code context above.`;

  const answer = await generateInsight(systemPrompt, userPrompt, 300);

  const sources = relevant.map((r) => ({
    path: r.metadata.path,
    relevance: Math.round(r.score * 100),
    snippet: r.text
      .substring(r.text.indexOf("\n\n") + 2)
      .split("\n")
      .slice(0, 3)
      .join("\n"),
  }));

  const confidence = relevant[0]?.score || 0;

  return { answer, sources, confidence };
}

export async function explainPR(
  title: string,
  body: string,
  diff: string,
  impactedFiles: string[]
): Promise<{ summary: string; risks: string[]; checklist: string[] }> {
  const systemPrompt = `You are a senior code reviewer. Analyze this pull request and provide:
1. A clear 2-3 sentence summary of what it does
2. 2-3 specific risk factors
3. 3-4 review checklist items
Format as JSON: {"summary": "...", "risks": [...], "checklist": [...]}`;

  const userPrompt = `PR Title: ${title}
PR Description: ${body.slice(0, 500)}
Changed Files: ${impactedFiles.join(", ")}
Diff Preview: ${diff.slice(0, 1000)}`;

  const response = await generateInsight(systemPrompt, userPrompt, 400);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fallback
  }

  return {
    summary: response.slice(0, 300),
    risks: ["Review carefully for unintended side effects"],
    checklist: ["Verify tests pass", "Check for breaking changes"],
  };
}

export async function generateCodeInsights(
  files: Array<{ path: string; language: string; lines: number; size: number }>,
  repoName: string
): Promise<string[]> {
  const stats = {
    totalFiles: files.length,
    languages: Array.from(new Set(files.map((f) => f.language))),
    largestFiles: files.sort((a, b) => b.lines - a.lines).slice(0, 3),
    avgLines: Math.round(files.reduce((s, f) => s + f.lines, 0) / files.length),
  };

  const systemPrompt = `You are DevPulse AI. Generate 3 brief engineering insights about this codebase.
Each insight should be 1-2 sentences and actionable. Return as JSON array: ["insight1", "insight2", "insight3"]`;

  const userPrompt = `Repository: ${repoName}
Total files: ${stats.totalFiles}
Languages: ${stats.languages.join(", ")}
Average file size: ${stats.avgLines} lines
Largest files: ${stats.largestFiles.map((f) => `${f.path} (${f.lines} lines)`).join(", ")}`;

  const response = await generateInsight(systemPrompt, userPrompt, 300);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fallback
  }

  return [
    `Repository has ${stats.totalFiles} files across ${stats.languages.length} languages`,
    `Consider reviewing large files for potential refactoring opportunities`,
    `Ensure consistent code style across all modules`,
  ];
}
