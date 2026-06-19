import { NextResponse } from "next/server";
import { deleteRecordFromFile, readRecordById } from "@/server/recordStore";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const record = await readRecordById(id);
    if (!record) {
      return NextResponse.json({ error: "RECORD_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "READ_RECORD_FAILED" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await deleteRecordFromFile(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DELETE_RECORD_FAILED" }, { status: 500 });
  }
}
