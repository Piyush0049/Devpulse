import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { analyzeFileRisk, computeHealthScore, analyzeTechDebt, generateAIInsights } from "@/lib/analysis";
import { getCommitActivity } from "@/lib/github";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const store = readStore();

    if (!store.repoInfo) {
      return NextResponse.json({ error: "No repository connected" }, { status: 400 });
    }

    // Reconstruct file contents
    const vectorsFile = path.join(process.cwd(), "data", "vectors.json");
    const fileContents: Record<string, string> = {};

    if (fs.existsSync(vectorsFile)) {
      const vectors = JSON.parse(fs.readFileSync(vectorsFile, "utf-8"));
      for (const v of vectors) {
        if (!fileContents[v.metadata.path]) {
          fileContents[v.metadata.path] = v.text.substring(v.text.indexOf("\n\n") + 2);
        } else {
          fileContents[v.metadata.path] += "\n" + v.text.substring(v.text.indexOf("\n\n") + 2);
        }
      }
    }

    const filesWithContent = store.files.map((f) => ({
      ...f,
      content: fileContents[f.path] || "",
    }));

    // Analyze risks and debt
    const risks = store.files.map((file) =>
      analyzeFileRisk(file.path, fileContents[file.path] || "", file.lines, file.language)
    );
    const debtItems = analyzeTechDebt(filesWithContent);

    // Get commit activity
    let commits = store.commits;
    if (!commits || commits.length === 0) {
      try {
        commits = await getCommitActivity(store.repoInfo.owner, store.repoInfo.name, store.githubToken);
        // Cache it
        store.commits = commits;
      } catch {
        commits = [];
      }
    }

    const healthScore = computeHealthScore(
      store.files,
      risks,
      debtItems,
      10, // recent PRs estimate
      store.repoInfo.openIssues
    );

    const aiInsights = generateAIInsights(
      risks,
      debtItems,
      store.repoInfo.openIssues,
      store.repoInfo.name
    );

    // Language breakdown
    const langMap: Record<string, number> = {};
    for (const f of store.files) {
      langMap[f.language] = (langMap[f.language] || 0) + 1;
    }
    const languages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / store.files.length) * 100),
      }));

    return NextResponse.json({
      healthScore,
      aiInsights,
      commits,
      languages,
      stats: {
        totalFiles: store.files.length,
        totalLines: store.files.reduce((s, f) => s + f.lines, 0),
        totalVectors: store.vectors.length,
        openIssues: store.repoInfo.openIssues,
        stars: store.repoInfo.stars,
        forks: store.repoInfo.forks,
      },
    });
  } catch (error) {
    console.error("Health error:", error);
    return NextResponse.json({ error: "Failed to compute health" }, { status: 500 });
  }
}
