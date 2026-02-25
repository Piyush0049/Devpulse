import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { analyzeFileRisk } from "@/lib/analysis";

export async function GET() {
  try {
    const store = await readStore();

    if (!store.repoInfo) {
      return NextResponse.json({ error: "No repository connected" }, { status: 400 });
    }

    let fileContents: Record<string, string> = {};
    const vectors = store.vectors || [];

    // Extract file contents from vector chunks
    for (const v of vectors) {
      if (!fileContents[v.metadata.path]) {
        fileContents[v.metadata.path] = v.text.substring(v.text.indexOf("\n\n") + 2);
      } else {
        fileContents[v.metadata.path] += "\n" + v.text.substring(v.text.indexOf("\n\n") + 2);
      }
    }

    const risks = store.files.map((file: any) => {
      const content = fileContents[file.path] || "";
      return analyzeFileRisk(file.path, content, file.lines, file.language);
    });

    // Sort by risk score descending
    risks.sort((a, b) => b.riskScore - a.riskScore);

    const summary = {
      critical: risks.filter((r) => r.riskLevel === "critical").length,
      high: risks.filter((r) => r.riskLevel === "high").length,
      medium: risks.filter((r) => r.riskLevel === "medium").length,
      low: risks.filter((r) => r.riskLevel === "low").length,
      avgScore: Math.round(risks.reduce((s, r) => s + r.riskScore, 0) / Math.max(1, risks.length)),
    };

    return NextResponse.json({ risks: risks.slice(0, 50), summary });
  } catch (error) {
    console.error("Risks error:", error);
    return NextResponse.json({ error: "Failed to analyze risks" }, { status: 500 });
  }
}
