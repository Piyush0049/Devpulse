import fs from "fs";
import path from "path";
import type { RepoStore, IndexingStatus } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const VECTORS_FILE = path.join(DATA_DIR, "vectors.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

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

export function readStore(): RepoStore {
  ensureDataDir();
  try {
    if (!fs.existsSync(STORE_FILE)) return { ...defaultStore };
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const store = JSON.parse(raw) as RepoStore;
    // Ensure arrays are initialized
    store.vectors = [];
    store.files = store.files || [];
    store.commits = store.commits || [];
    // Load vectors separately (can be large)
    if (fs.existsSync(VECTORS_FILE)) {
      try {
        const vectorsRaw = fs.readFileSync(VECTORS_FILE, "utf-8");
        store.vectors = JSON.parse(vectorsRaw) || [];
      } catch {
        store.vectors = [];
      }
    }
    return store;
  } catch {
    return { ...defaultStore };
  }
}

export function writeStore(store: RepoStore) {
  ensureDataDir();
  const { vectors, ...rest } = store;
  fs.writeFileSync(STORE_FILE, JSON.stringify(rest, null, 2));
  // Write vectors separately
  fs.writeFileSync(VECTORS_FILE, JSON.stringify(vectors));
}

export function updateIndexingStatus(status: Partial<IndexingStatus>) {
  const store = readStore();
  store.indexingStatus = { ...store.indexingStatus, ...status };
  const { vectors, ...rest } = store;
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(rest, null, 2));
}

export function clearStore() {
  ensureDataDir();
  writeStore({ ...defaultStore });
}
