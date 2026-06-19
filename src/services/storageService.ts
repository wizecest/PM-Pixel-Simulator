import type { ScenarioInput, SimulationRecord } from "@/types/simulation";

export const STORAGE_KEY = "pm_pixel_simulator_records";
export const CURRENT_INPUT_KEY = "pm_pixel_simulator_current_input";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getLegacyRecords(): SimulationRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const records = parseJson<SimulationRecord[]>(window.localStorage.getItem(STORAGE_KEY), []);
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function migrateLegacyRecords(records: SimulationRecord[]) {
  const legacyRecords = getLegacyRecords();
  const missingRecords = legacyRecords.filter((legacyRecord) => !records.some((record) => record.id === legacyRecord.id));

  if (missingRecords.length === 0) {
    return records;
  }

  for (const record of missingRecords) {
    await saveRecord(record);
  }

  return [...missingRecords, ...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRecords(): Promise<SimulationRecord[]> {
  const records = await requestJson<SimulationRecord[]>("/api/records");
  return migrateLegacyRecords(records);
}

export async function getRecordById(id: string): Promise<SimulationRecord | undefined> {
  try {
    return await requestJson<SimulationRecord>(`/api/records/${encodeURIComponent(id)}`);
  } catch {
    return getLegacyRecords().find((record) => record.id === id);
  }
}

export async function saveRecord(record: SimulationRecord): Promise<void> {
  await requestJson<SimulationRecord>("/api/records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (canUseStorage()) {
    const legacyRecords = getLegacyRecords();
    const nextRecords = [record, ...legacyRecords.filter((item) => item.id !== record.id)];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  }
}

export async function deleteRecord(id: string): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (canUseStorage()) {
    const nextRecords = getLegacyRecords().filter((record) => record.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  }
}

export function clearRecords(): void {
  if (!canUseStorage()) {
    throw new Error("localStorage is not available");
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function saveCurrentInput(input: ScenarioInput): void {
  if (!canUseStorage()) {
    throw new Error("localStorage is not available");
  }

  window.localStorage.setItem(CURRENT_INPUT_KEY, JSON.stringify(input));
}

export function getCurrentInput(): ScenarioInput | undefined {
  if (!canUseStorage()) {
    return undefined;
  }

  return parseJson<ScenarioInput | undefined>(window.localStorage.getItem(CURRENT_INPUT_KEY), undefined);
}

export function clearCurrentInput(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CURRENT_INPUT_KEY);
}
