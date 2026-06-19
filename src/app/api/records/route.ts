import { NextResponse } from "next/server";
import { readRecords, saveRecordToFile } from "@/server/recordStore";
import type { SimulationRecord } from "@/types/simulation";

export const runtime = "nodejs";

function isSimulationRecord(value: unknown): value is SimulationRecord {
  const record = value as Partial<SimulationRecord>;
  return Boolean(
    record &&
      typeof record.id === "string" &&
      record.input &&
      typeof record.selectedSceneId === "string" &&
      Array.isArray(record.selectedRoleIds) &&
      typeof record.levelName === "string" &&
      typeof record.createdAt === "string",
  );
}

export async function GET() {
  try {
    return NextResponse.json(await readRecords());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "READ_RECORDS_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let record: unknown;
  try {
    record = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  if (!isSimulationRecord(record)) {
    return NextResponse.json({ error: "INVALID_RECORD" }, { status: 400 });
  }

  try {
    return NextResponse.json(await saveRecordToFile(record));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "SAVE_RECORD_FAILED" }, { status: 500 });
  }
}
