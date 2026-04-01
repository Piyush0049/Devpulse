import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { analyzeTechDebt } from "@/lib/analysis";

export async function GET() {
  try {
    const store = await readStore();

    if (!store.repoInfo) {
      return NextResponse.json({ error: "No repository connected" }, { status: 400 });
    }

    const fileContents: Record<string, string> = {};
    const vectors = store.vectors || [];

    for (const v of vectors) {
      if (!fileContents[v.metadata.path]) {
        fileContents[v.metadata.path] = v.text.substring(v.text.indexOf("\n\n") + 2);
      } else {
        fileContents[v.metadata.path] += "\n" + v.text.substring(v.text.indexOf("\n\n") + 2);
      }
    }

    const filesWithContent = store.files.map((f: any) => ({
      ...f,
      content: fileContents[f.path] || "",
    }));

    const debtItems = analyzeTechDebt(filesWithContent);

    const totalDebtScore = debtItems.reduce((s, d) => s + d.debtScore, 0);
    const normalizedDebt = Math.min(100, Math.round(totalDebtScore / Math.max(1, debtItems.length)));

    const summary = {
      total: debtItems.length,
      high: debtItems.filter((d) => d.severity === "high").length,
      medium: debtItems.filter((d) => d.severity === "medium").length,
      low: debtItems.filter((d) => d.severity === "low").length,
      byType: {
        "long-file": debtItems.filter((d) => d.type === "long-file").length,
        complexity: debtItems.filter((d) => d.type === "complexity").length,
        todo: debtItems.filter((d) => d.type === "todo").length,
        duplicate: debtItems.filter((d) => d.type === "duplicate").length,
        "dead-code": debtItems.filter((d) => d.type === "dead-code").length,
      },
      debtScore: normalizedDebt,
    };

    return NextResponse.json({ items: debtItems, summary });
  } catch (error) {
    console.error("Debt error:", error);
    return NextResponse.json({ error: "Failed to analyze tech debt" }, { status: 500 });
  }
}
