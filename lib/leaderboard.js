import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "leaderboard.json");
const REDIS_KEY = "sudoku_leaderboard";
const MAX_ENTRIES = 100;

function hasUpstash() {
  return (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function upstash(command, ...args) {
  const base = process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/${command}/${args.join("/")}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
  });
  if (!res.ok) throw new Error("Redis request failed");
  return res.json();
}

export async function getLeaderboard() {
  if (hasUpstash()) {
    const data = await upstash("get", REDIS_KEY);
    if (!data.result) return [];
    try {
      return JSON.parse(data.result);
    } catch {
      return [];
    }
  }

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLeaderboard(scores) {
  const payload = JSON.stringify(scores);

  if (hasUpstash()) {
    await upstash("set", REDIS_KEY, encodeURIComponent(payload));
    return;
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(scores, null, 2), "utf8");
}

export async function addScore({ name, timeSeconds }) {
  const scores = await getLeaderboard();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    timeSeconds,
    createdAt: new Date().toISOString(),
  };

  const updated = [...scores, entry]
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .slice(0, MAX_ENTRIES);

  await saveLeaderboard(updated);
  return entry;
}
