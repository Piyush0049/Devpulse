import { Octokit } from "@octokit/rest";
import type { RepoInfo, FileEntry, CommitActivity, PRAnalysis } from "@/types";

const SUPPORTED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go",
  ".rs", ".cpp", ".c", ".cs", ".rb", ".php", ".swift",
  ".kt", ".scala", ".r", ".md", ".json", ".yaml", ".yml",
  ".toml", ".sh", ".bash", ".sql", ".graphql", ".vue",
]);

const LANGUAGE_MAP: Record<string, string> = {
  ".ts": "TypeScript", ".tsx": "TypeScript",
  ".js": "JavaScript", ".jsx": "JavaScript",
  ".py": "Python", ".java": "Java",
  ".go": "Go", ".rs": "Rust",
  ".cpp": "C++", ".c": "C",
  ".cs": "C#", ".rb": "Ruby",
  ".php": "PHP", ".swift": "Swift",
  ".kt": "Kotlin", ".scala": "Scala",
  ".sql": "SQL", ".md": "Markdown",
  ".json": "JSON", ".yaml": "YAML", ".yml": "YAML",
  ".sh": "Shell", ".bash": "Shell",
  ".graphql": "GraphQL", ".vue": "Vue",
};

function getOctokit(token?: string) {
  const tok = token || process.env.GITHUB_TOKEN;
  const isValid =
    tok &&
    tok.length > 10 &&
    !tok.includes("your_token") &&
    !tok.includes("your_key") &&
    !tok.includes("placeholder");

  if (!isValid) return new Octokit();

  // Use explicit Bearer format — GitHub's recommended Authorization header
  const octokit = new Octokit({ auth: tok });
  octokit.hook.before("request", (options) => {
    options.headers["authorization"] = `Bearer ${tok}`;
    options.headers["accept"] = "application/vnd.github+json";
    options.headers["X-GitHub-Api-Version"] = "2022-11-28";
  });
  return octokit;
}

export async function verifyGitHubToken(token?: string): Promise<{ ok: boolean; authenticated: boolean; remaining: number; error?: string }> {
  try {
    const octokit = getOctokit(token);
    const { data } = await octokit.rateLimit.get();
    const authenticated = data.resources.core.limit > 60;
    return { ok: true, authenticated, remaining: data.resources.core.remaining };
  } catch (e: unknown) {
    return { ok: false, authenticated: false, remaining: 0, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\s?#]+)/,
    /^([^\/]+)\/([^\/\s]+)$/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  }
  return null;
}

export async function getRepoInfo(owner: string, repo: string, token?: string): Promise<RepoInfo> {
  const octokit = getOctokit(token);
  const { data } = await octokit.repos.get({ owner, repo });
  return {
    owner,
    name: data.name,
    fullName: data.full_name,
    description: data.description || "",
    language: data.language || "Unknown",
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    defaultBranch: data.default_branch,
    url: data.html_url,
    lastPushedAt: data.pushed_at || new Date().toISOString(),
    size: data.size,
  };
}

async function getAllFiles(
  octokit: ReturnType<typeof getOctokit>,
  owner: string,
  repo: string,
  branch: string,
  onProgress?: (current: string, indexed: number, total: number) => void
): Promise<FileEntry[]> {
  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "1",
  });

  const codeFiles = tree.tree.filter((item) => {
    if (item.type !== "blob") return false;
    if (!item.path) return false;
    // Skip node_modules, .git, build dirs
    if (/node_modules|\.git|\.next|dist\/|build\/|vendor\//.test(item.path)) return false;
    // Skip large binary files
    if ((item.size || 0) > 100000) return false;
    const ext = "." + item.path.split(".").pop()?.toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
  });

  const files: FileEntry[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < codeFiles.length; i += BATCH_SIZE) {
    const batch = codeFiles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        if (!item.path || !item.sha) return null;
        try {
          const { data: blob } = await octokit.git.getBlob({ owner, repo, file_sha: item.sha });
          const content = Buffer.from(blob.content, "base64").toString("utf-8");
          const ext = "." + item.path.split(".").pop()?.toLowerCase();
          const lines = content.split("\n").length;
          return {
            path: item.path,
            content,
            size: item.size || 0,
            language: LANGUAGE_MAP[ext] || "Unknown",
            lines,
          } as FileEntry;
        } catch {
          return null;
        }
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value) {
        files.push(result.value);
      }
    }

    if (onProgress) {
      onProgress(
        batch[0]?.path || "",
        files.length,
        codeFiles.length
      );
    }

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < codeFiles.length) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  return files;
}

export async function indexRepository(
  owner: string,
  repo: string,
  branch: string,
  onProgress: (current: string, indexed: number, total: number) => void,
  token?: string
): Promise<FileEntry[]> {
  const octokit = getOctokit(token);
  return getAllFiles(octokit, owner, repo, branch, onProgress);
}

export async function getCommitActivity(owner: string, repo: string, token?: string): Promise<CommitActivity[]> {
  const octokit = getOctokit(token);
  try {
    const { data } = await octokit.repos.getCommitActivityStats({ owner, repo });
    if (!data || data.length === 0) return [];

    return data.slice(-12).map((week) => ({
      week: new Date(week.week * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      commits: week.total,
      additions: week.days.reduce((sum: number, d: number) => sum + (d > 0 ? d : 0), 0),
      deletions: week.days.reduce((sum: number, d: number) => sum + (d < 0 ? Math.abs(d) : 0), 0),
      authors: 1,
    }));
  } catch {
    return [];
  }
}

export async function getPullRequests(owner: string, repo: string, limit = 10, token?: string): Promise<PRAnalysis[]> {
  const octokit = getOctokit(token);
  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: "all",
    per_page: limit,
    sort: "updated",
  });

  const analyses: PRAnalysis[] = [];

  for (const pr of prs.slice(0, limit)) {
    try {
      const { data: files } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pr.number,
        per_page: 100,
      });

      const linesAdded = files.reduce((sum, f) => sum + f.additions, 0);
      const linesRemoved = files.reduce((sum, f) => sum + f.deletions, 0);
      const filesChanged = files.length;

      // Compute risk score
      const riskScore = computePRRisk(linesAdded, linesRemoved, filesChanged, files);
      const riskLevel = getRiskLevel(riskScore);

      // Extract impacted modules
      const impactedModules = Array.from(new Set(
        files.map((f) => f.filename.split("/")[0] || f.filename)
      )).slice(0, 6);

      analyses.push({
        number: pr.number,
        title: pr.title,
        author: pr.user?.login || "unknown",
        url: pr.html_url,
        state: pr.state,
        createdAt: pr.created_at,
        linesAdded,
        linesRemoved,
        filesChanged,
        riskScore,
        riskLevel,
        summary: pr.body?.slice(0, 300) || "No description provided.",
        impactedModules,
        reviewChecklist: generateChecklist(riskLevel, filesChanged),
        labels: pr.labels?.map((l) => (typeof l === "string" ? l : l.name || "")) ?? [],
        body: pr.body || "",
      });
    } catch {
      // Skip PR if we can't get details
    }
  }

  return analyses;
}

function computePRRisk(
  added: number,
  removed: number,
  files: number,
  fileList: Array<{ filename: string }>
): number {
  let score = 0;

  // Size factor
  const totalChanges = added + removed;
  if (totalChanges > 1000) score += 40;
  else if (totalChanges > 500) score += 25;
  else if (totalChanges > 100) score += 15;
  else score += 5;

  // Files factor
  if (files > 20) score += 30;
  else if (files > 10) score += 20;
  else if (files > 5) score += 10;
  else score += 5;

  // Critical file patterns
  const criticalPatterns = ["auth", "security", "payment", "database", "config", "migration", "schema"];
  const hasCritical = fileList.some((f) =>
    criticalPatterns.some((p) => f.filename.toLowerCase().includes(p))
  );
  if (hasCritical) score += 20;

  return Math.min(100, score);
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function generateChecklist(riskLevel: string, files: number): string[] {
  const base = [
    "Review all changed files",
    "Check for test coverage",
    "Verify no breaking changes",
  ];
  if (riskLevel === "high" || riskLevel === "critical") {
    base.push("Security review required");
    base.push("Performance impact assessment");
    base.push("Rollback plan documented");
  }
  if (files > 10) base.push("Consider splitting into smaller PRs");
  return base;
}
