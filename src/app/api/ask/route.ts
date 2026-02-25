import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { queryCodebase } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const store = readStore();

    if (store.indexingStatus.status !== "done") {
      return NextResponse.json(
        { error: "Repository not indexed yet. Please connect a repo first." },
        { status: 400 }
      );
    }

    const result = await queryCodebase(question, store.vectors);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ask error:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
