import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { getPullRequests } from "@/lib/github";

export async function GET() {
  try {
    const store = readStore();

    if (!store.repoInfo) {
      return NextResponse.json({ error: "No repository connected" }, { status: 400 });
    }

    const { owner, name } = store.repoInfo;
    const prs = await getPullRequests(owner, name, 10, store.githubToken);

    return NextResponse.json({ prs, total: prs.length });
  } catch (error) {
    console.error("PRs error:", error);
    return NextResponse.json({ error: "Failed to fetch pull requests" }, { status: 500 });
  }
}
