import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SimulationRecord } from "@/types/simulation";

const RECORDS_DIR = path.join(process.cwd(), "storage");
const RECORDS_PATH = path.join(RECORDS_DIR, "simulation-records.json");

async function ensureStore() {
  await mkdir(RECORDS_DIR, { recursive: true });

  try {
    await readFile(RECORDS_PATH, "utf8");
  } catch {
    await writeFile(RECORDS_PATH, "[]\n", "utf8");
  }
}

function parseRecords(value: string): SimulationRecord[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as SimulationRecord[]) : [];
  } catch {
    return [];
  }
}

function sortRecords(records: SimulationRecord[]) {
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readRecords() {
  await ensureStore();
  const content = await readFile(RECORDS_PATH, "utf8");
  return sortRecords(parseRecords(content));
}

export async function readRecordById(id: string) {
  const records = await readRecords();
  return records.find((record) => record.id === id);
}

export async function saveRecordToFile(record: SimulationRecord) {
  const records = await readRecords();
  const nextRecords = sortRecords([record, ...records.filter((item) => item.id !== record.id)]);
  await writeFile(RECORDS_PATH, `${JSON.stringify(nextRecords, null, 2)}\n`, "utf8");
  return record;
}

export async function deleteRecordFromFile(id: string) {
  const records = await readRecords();
  const nextRecords = records.filter((record) => record.id !== id);
  await writeFile(RECORDS_PATH, `${JSON.stringify(nextRecords, null, 2)}\n`, "utf8");
}
