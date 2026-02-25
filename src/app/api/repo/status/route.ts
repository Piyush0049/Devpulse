import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({
      status: store.indexingStatus,
      repoInfo: store.repoInfo,
      filesCount: store.files?.length ?? 0,
      vectorsCount: store.vectors?.length ?? 0,
      lastUpdated: store.lastUpdated,
    });
  } catch {
    return NextResponse.json({ error: "Failed to read status" }, { status: 500 });
  }
}
