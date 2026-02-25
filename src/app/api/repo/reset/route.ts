import { NextResponse } from "next/server";
import { clearStore } from "@/lib/store";

export async function POST() {
  try {
    await clearStore();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }
}
