export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  url: string;
  lastPushedAt: string;
  size: number;
}

export interface FileEntry {
  path: string;
  content: string;
  size: number;
  language: string;
  lines: number;
}

export interface VectorEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    path: string;
    type: "file" | "function" | "class" | "chunk";
    repo: string;
    language: string;
    lines?: number;
    size?: number;
  };
}

export interface IndexingStatus {
  status: "idle" | "indexing" | "done" | "error";
  progress: number;
  total: number;
  current: string;
  filesIndexed: number;
  error?: string;
  repoInfo?: RepoInfo;
  startedAt?: string;
  completedAt?: string;
}

export interface PRAnalysis {
  number: number;
  title: string;
  author: string;
  url: string;
  state: string;
  createdAt: string;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  impactedModules: string[];
  reviewChecklist: string[];
  labels: string[];
  body: string;
}

export interface FileRisk {
  path: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: {
    complexity: number;
    churn: number;
    size: number;
    coverage: number;
    issues: number;
  };
  language: string;
  lines: number;
  lastModified: string;
}

export interface TechDebtItem {
  id: string;
  path: string;
  type: "large-function" | "duplicate" | "dead-code" | "complexity" | "todo" | "long-file";
  severity: "low" | "medium" | "high";
  description: string;
  line?: number;
  suggestion: string;
  debtScore: number;
}

export interface HealthScore {
  overall: number;
  breakdown: {
    codeQuality: number;
    riskLevel: number;
    velocity: number;
    techDebt: number;
    coverage: number;
  };
  trend: "improving" | "stable" | "declining";
  insights: string[];
}

export interface CommitActivity {
  week: string;
  commits: number;
  additions: number;
  deletions: number;
  authors: number;
}

export interface AIInsight {
  id: string;
  type: "risk" | "info" | "warning" | "success" | "action";
  title: string;
  body: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
}

export interface QueryResult {
  answer: string;
  sources: Array<{
    path: string;
    relevance: number;
    snippet: string;
  }>;
  confidence: number;
}

export interface RepoStore {
  repoInfo?: RepoInfo;
  indexingStatus: IndexingStatus;
  vectors: VectorEntry[];
  files: Array<{
    path: string;
    language: string;
    lines: number;
    size: number;
  }>;
  commits: CommitActivity[];
  lastUpdated?: string;
  githubToken?: string;
}
