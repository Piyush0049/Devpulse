import clientPromise from "./mongodb";
import type { RepoStore, IndexingStatus } from "@/types";

const DB_NAME = "devpulse";
const COLLECTION_NAME = "state";

const defaultStore: RepoStore = {
  indexingStatus: {
    status: "idle",
    progress: 0,
    total: 0,
    current: "",
    filesIndexed: 0,
  },
  vectors: [],
  files: [],
  commits: [],
};

// Singleton document ID for the app state
const STATE_ID = "app_state";

export async function readStore(): Promise<RepoStore> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const state = await db.collection(COLLECTION_NAME).findOne({ _id: STATE_ID as any });

    if (!state) return { ...defaultStore };

    // Remove MongoDB _id and return
    const { _id, ...rest } = state;
    return rest as unknown as RepoStore;
  } catch (err) {
    console.error("Failed to read from MongoDB:", err);
    return { ...defaultStore };
  }
}

export async function writeStore(store: RepoStore): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    // Use replaceOne with upsert to keep a single document for the app state
    await db.collection(COLLECTION_NAME).replaceOne(
      { _id: STATE_ID as any },
      { ...store, _id: STATE_ID as any },
      { upsert: true }
    );
  } catch (err) {
    console.error("Failed to write to MongoDB:", err);
  }
}

export async function updateIndexingStatus(status: Partial<IndexingStatus>): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Use $set to update nesting indexingStatus fields
    const updateObj: any = {};
    for (const [key, value] of Object.entries(status)) {
      updateObj[`indexingStatus.${key}`] = value;
    }

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: STATE_ID as any },
      { $set: updateObj },
      { upsert: true }
    );
  } catch (err) {
    console.error("Failed to update indexing status in MongoDB:", err);
  }
}

export async function clearStore(): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION_NAME).deleteOne({ _id: STATE_ID as any });
  } catch (err) {
    console.error("Failed to clear MongoDB store:", err);
  }
}
