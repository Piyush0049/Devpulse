import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, getRepoInfo, indexRepository, verifyGitHubToken, getCommitActivity } from "@/lib/github";
import { embedText } from "@/lib/embeddings";
import { chunkFile, buildVectorEntries } from "@/lib/vectorStore";
import { readStore, writeStore, updateIndexingStatus } from "@/lib/store";
import type { VectorEntry } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, githubToken } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Use format: github.com/owner/repo" },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const token = githubToken?.trim() || process.env.GITHUB_TOKEN;

    const auth = await verifyGitHubToken(token);
    if (!auth.ok) {
      return NextResponse.json({ error: `GitHub API error: ${auth.error}` }, { status: 400 });
    }
    if (auth.remaining < 50) {
      return NextResponse.json({
        error: `GitHub API rate limit low (${auth.remaining} requests remaining). Please wait and retry.`,
      }, { status: 429 });
    }

    let repoInfo;
    try {
      repoInfo = await getRepoInfo(owner, repo, token);
    } catch (e: unknown) {
      const httpStatus = (e as { status?: number })?.status;
      if (httpStatus === 404) {
        return NextResponse.json({
          error: `Repository "${owner}/${repo}" not found. If it's a private repo, make sure your PAT has the "repo" scope (full control of private repositories).`,
        }, { status: 404 });
      }
      if (httpStatus === 401 || httpStatus === 403) {
        return NextResponse.json({
          error: `Access denied to "${owner}/${repo}". Your token may not have the required permissions.`,
        }, { status: 403 });
      }
      return NextResponse.json({
        error: `Could not access repository "${owner}/${repo}". Check the URL and token.`,
      }, { status: 400 });
    }

    await updateIndexingStatus({
      status: "indexing",
      progress: 0,
      total: 0,
      current: "Fetching repository info...",
      filesIndexed: 0,
      startedAt: new Date().toISOString(),
    });

    indexInBackground(owner, repo, token, repoInfo).catch(async (err) => {
      console.error("Background indexing error:", err);
      await updateIndexingStatus({
        status: "error",
        error: err.message || "Indexing failed",
      });
    });

    return NextResponse.json({
      message: "Indexing started",
      repo: `${owner}/${repo}`,
    });
  } catch (error) {
    console.error("Connect error:", error);
    return NextResponse.json(
      { error: "Failed to start indexing" },
      { status: 500 }
    );
  }
}

async function indexInBackground(owner: string, repo: string, token?: string, repoInfo?: Awaited<ReturnType<typeof getRepoInfo>>) {
  try {
    if (!repoInfo) {
      repoInfo = await getRepoInfo(owner, repo, token);
    }

    await updateIndexingStatus({
      current: `Connected to ${repoInfo.fullName}`,
      repoInfo,
    });

    const vectors: VectorEntry[] = [];
    const filesMeta: Array<{ path: string; language: string; lines: number; size: number }> = [];

    const files = await indexRepository(
      owner,
      repo,
      repoInfo.defaultBranch,
      async (current, indexed, total) => {
        await updateIndexingStatus({
          current: `Indexing: ${current}`,
          progress: indexed,
          total,
          filesIndexed: indexed,
        });
      },
      token
    );

    const filesToEmbed = files.slice(0, 50);
    const FILE_BATCH = 4;

    await updateIndexingStatus({
      current: "Creating embeddings...",
      total: filesToEmbed.length,
    });

    let indexed = 0;
    for (let i = 0; i < filesToEmbed.length; i += FILE_BATCH) {
      const batch = filesToEmbed.slice(i, i + FILE_BATCH);

      await updateIndexingStatus({
        current: `Embedding: ${batch[0]?.path}`,
        progress: indexed,
        filesIndexed: indexed,
      });

      await Promise.allSettled(
        batch.map(async (file) => {
          try {
            const chunks = chunkFile(file);
            const chunkTexts = chunks.map((c) => c.text).slice(0, 2);

            const embeddings = await Promise.all(chunkTexts.map((text) => embedText(text)));

            const entries = buildVectorEntries(
              file,
              embeddings,
              chunkTexts.map((t) => ({ text: t }))
            );
            entries.forEach((e) => (e.metadata.repo = `${owner}/${repo}`));
            vectors.push(...entries);
          } catch (err) {
            console.error(`Failed to embed ${file.path}:`, err);
          }

          filesMeta.push({
            path: file.path,
            language: file.language,
            lines: file.lines,
            size: file.size,
          });
          indexed++;
        })
      );

      if (i + FILE_BATCH < filesToEmbed.length) {
        await new Promise((r) => setTimeout(r, 80));
      }
    }

    // Fetch commit activity during indexing
    await updateIndexingStatus({
      current: "Auditing temporal activity...",
    });
    const commits = await getCommitActivity(owner, repo, token);

    const store = await readStore();
    store.repoInfo = repoInfo;
    store.vectors = vectors;
    store.files = filesMeta;
    store.commits = commits;
    store.lastUpdated = new Date().toISOString();
    if (token) store.githubToken = token;
    store.indexingStatus = {
      status: "done",
      progress: filesToEmbed.length,
      total: filesToEmbed.length,
      current: "Indexing complete",
      filesIndexed: filesToEmbed.length,
      repoInfo,
      startedAt: store.indexingStatus.startedAt,
      completedAt: new Date().toISOString(),
    };

    await writeStore(store);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await updateIndexingStatus({
      status: "error",
      error: message,
    });
    throw error;
  }
}
