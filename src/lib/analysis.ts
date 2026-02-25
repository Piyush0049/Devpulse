import type { FileRisk, TechDebtItem, HealthScore, AIInsight } from "@/types";

// ─── Risk Analysis ────────────────────────────────────────────────────────────

export function analyzeFileRisk(
  path: string,
  content: string,
  lines: number,
  language: string
): FileRisk {
  const factors = {
    complexity: computeComplexity(content, language),
    churn: 50, // Placeholder (would need git history)
    size: computeSizeScore(lines),
    coverage: 50, // Placeholder
    issues: countIssues(content),
  };

  const riskScore = Math.round(
    factors.complexity * 0.3 +
    factors.size * 0.25 +
    factors.issues * 0.25 +
    factors.churn * 0.2
  );

  return {
    path,
    riskScore: Math.min(100, riskScore),
    riskLevel: getRiskLevel(riskScore),
    factors,
    language,
    lines,
    lastModified: new Date().toISOString(),
  };
}

function computeComplexity(content: string, language: string): number {
  // Count complexity indicators
  const ifCount = (content.match(/\bif\b/g) || []).length;
  const forCount = (content.match(/\bfor\b/g) || []).length;
  const whileCount = (content.match(/\bwhile\b/g) || []).length;
  const switchCount = (content.match(/\bswitch\b/g) || []).length;
  const catchCount = (content.match(/\bcatch\b/g) || []).length;
  const ternaryCount = (content.match(/\?.*:/g) || []).length;
  const nestedCount = (content.match(/\{\s*\{/g) || []).length;

  const cyclomaticBase = ifCount + forCount + whileCount + switchCount + catchCount + ternaryCount;
  const lines = content.split("\n").length;

  // Normalize to 0-100
  const score = Math.min(100, (cyclomaticBase / Math.max(1, lines / 20)) * 30 + nestedCount * 5);
  return Math.round(score);
}

function computeSizeScore(lines: number): number {
  if (lines > 1000) return 90;
  if (lines > 500) return 70;
  if (lines > 300) return 50;
  if (lines > 100) return 30;
  return 10;
}

function countIssues(content: string): number {
  const todoCount = (content.match(/\b(TODO|FIXME|HACK|XXX|BUG|TEMP)\b/gi) || []).length;
  const consoleCount = (content.match(/console\.(log|warn|error)/g) || []).length;
  const anyCount = (content.match(/:\s*any\b/g) || []).length;
  const disableCount = (content.match(/eslint-disable|@ts-ignore|@ts-nocheck/g) || []).length;

  const total = todoCount * 3 + consoleCount + anyCount * 2 + disableCount * 4;
  return Math.min(100, total * 5);
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

// ─── Tech Debt Analysis ───────────────────────────────────────────────────────

export function analyzeTechDebt(
  files: Array<{ path: string; content: string; lines: number; language: string }>
): TechDebtItem[] {
  const items: TechDebtItem[] = [];

  for (const file of files) {
    // Large files
    if (file.lines > 500) {
      items.push({
        id: `large-${file.path}`,
        path: file.path,
        type: "long-file",
        severity: file.lines > 1000 ? "high" : "medium",
        description: `File has ${file.lines} lines — consider splitting into smaller modules`,
        suggestion: "Extract related functions into separate files or modules",
        debtScore: Math.min(100, Math.round(file.lines / 10)),
      });
    }

    // TODO/FIXME comments
    const todoMatches = Array.from(file.content.matchAll(/\/\/.*(TODO|FIXME|HACK|XXX)[:.]?\s*(.+)/gi));
    for (const match of todoMatches.slice(0, 3)) {
      const lineNum = file.content.substring(0, match.index).split("\n").length;
      items.push({
        id: `todo-${file.path}-${lineNum}`,
        path: file.path,
        type: "todo",
        severity: match[1].toUpperCase() === "FIXME" ? "high" : "medium",
        description: `${match[1].toUpperCase()}: ${match[2]?.trim().slice(0, 80)}`,
        line: lineNum,
        suggestion: "Address this technical debt item",
        debtScore: match[1].toUpperCase() === "FIXME" ? 60 : 30,
      });
    }

    // Long functions
    const funcMatches = Array.from(
      file.content.matchAll(/function\s+(\w+)[^{]*\{|(\w+)\s*[:=]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/g)
    );
    if (funcMatches.length > 0) {
      // Check average function size
      const avgFuncSize = file.lines / Math.max(1, funcMatches.length);
      if (avgFuncSize > 50) {
        items.push({
          id: `complexity-${file.path}`,
          path: file.path,
          type: "complexity",
          severity: avgFuncSize > 100 ? "high" : "medium",
          description: `Average function length is ${Math.round(avgFuncSize)} lines — functions may be too large`,
          suggestion: "Break down large functions into smaller, focused units",
          debtScore: Math.min(100, Math.round(avgFuncSize)),
        });
      }
    }

    // TypeScript `any` usage
    const anyCount = (file.content.match(/:\s*any\b/g) || []).length;
    if (anyCount > 3) {
      items.push({
        id: `any-${file.path}`,
        path: file.path,
        type: "dead-code",
        severity: anyCount > 10 ? "high" : "medium",
        description: `Found ${anyCount} uses of 'any' type — reduces type safety`,
        suggestion: "Replace 'any' with proper TypeScript types or generics",
        debtScore: Math.min(100, anyCount * 5),
      });
    }
  }

  return items.sort((a, b) => b.debtScore - a.debtScore).slice(0, 50);
}

// ─── Health Score ─────────────────────────────────────────────────────────────

export function computeHealthScore(
  files: Array<{ path: string; lines: number; language: string }>,
  risks: FileRisk[],
  debtItems: TechDebtItem[],
  prCount: number,
  openIssues: number
): HealthScore {
  const avgRisk = risks.length
    ? risks.reduce((s, r) => s + r.riskScore, 0) / risks.length
    : 30;

  const highRiskFiles = risks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length;
  const riskLevelScore = Math.max(0, 100 - avgRisk - highRiskFiles * 2);

  const debtScore = Math.max(0, 100 - Math.min(100, debtItems.length * 2));

  const codeQuality = Math.max(
    0,
    100 -
      (files.filter((f) => f.lines > 500).length * 5) -
      (debtItems.filter((d) => d.severity === "high").length * 3)
  );

  const velocity = Math.min(100, 50 + prCount * 5);

  const overall = Math.round(
    codeQuality * 0.3 +
    riskLevelScore * 0.25 +
    debtScore * 0.25 +
    velocity * 0.2
  );

  const trend = overall >= 70 ? "improving" : overall >= 50 ? "stable" : "declining";

  const insights: string[] = [];
  if (highRiskFiles > 0) insights.push(`${highRiskFiles} high-risk files need attention`);
  if (debtItems.filter((d) => d.type === "todo").length > 5)
    insights.push("Multiple TODO items accumulating — consider a debt sprint");
  if (codeQuality < 60) insights.push("Code quality declining — enforce review standards");
  if (openIssues > 20) insights.push(`${openIssues} open issues — triage recommended`);
  if (insights.length === 0) insights.push("Repository health is good — maintain momentum");

  return {
    overall: Math.min(100, overall),
    breakdown: {
      codeQuality: Math.round(codeQuality),
      riskLevel: Math.round(riskLevelScore),
      velocity: Math.round(velocity),
      techDebt: Math.round(debtScore),
      coverage: 65, // placeholder
    },
    trend,
    insights,
  };
}

// ─── AI Insights Feed ─────────────────────────────────────────────────────────

export function generateAIInsights(
  risks: FileRisk[],
  debtItems: TechDebtItem[],
  openIssues: number,
  repoName: string
): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date().toISOString();

  // Critical risk files
  const criticalFiles = risks.filter((r) => r.riskLevel === "critical");
  if (criticalFiles.length > 0) {
    insights.push({
      id: "risk-critical",
      type: "risk",
      title: `${criticalFiles.length} Critical Risk Files Detected`,
      body: `Files like ${criticalFiles[0].path} have risk scores above 75. These files have high complexity and may introduce bugs during changes.`,
      timestamp: now,
      priority: "high",
      actionable: true,
    });
  }

  // High debt
  const highDebt = debtItems.filter((d) => d.severity === "high");
  if (highDebt.length > 3) {
    insights.push({
      id: "debt-high",
      type: "warning",
      title: "Technical Debt Accumulating",
      body: `${highDebt.length} high-severity debt items found. Schedule a refactoring sprint to address FIXME comments and oversized files.`,
      timestamp: now,
      priority: "medium",
      actionable: true,
    });
  }

  // Large files
  const largeFiles = risks.filter((r) => r.lines > 500);
  if (largeFiles.length > 0) {
    insights.push({
      id: "large-files",
      type: "info",
      title: "Large Files Detected",
      body: `${largeFiles.length} files exceed 500 lines. Consider modularizing ${largeFiles[0].path} to improve maintainability.`,
      timestamp: now,
      priority: "low",
      actionable: true,
    });
  }

  // Open issues
  if (openIssues > 15) {
    insights.push({
      id: "issues-high",
      type: "warning",
      title: `${openIssues} Open Issues in ${repoName}`,
      body: "Issue backlog is growing. Consider running a triage session to close stale issues and prioritize critical bugs.",
      timestamp: now,
      priority: "medium",
      actionable: true,
    });
  }

  // Success insight
  const lowRiskFiles = risks.filter((r) => r.riskLevel === "low").length;
  if (lowRiskFiles > risks.length * 0.6) {
    insights.push({
      id: "health-good",
      type: "success",
      title: "Codebase Health is Strong",
      body: `${Math.round((lowRiskFiles / risks.length) * 100)}% of files have low risk scores. The team is maintaining good code quality standards.`,
      timestamp: now,
      priority: "low",
      actionable: false,
    });
  }

  return insights.slice(0, 6);
}
