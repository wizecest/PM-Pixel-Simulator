import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { databaseProjectToScenarioInput, parseProjectDatabase } from "@/services/snapshotBridge";
import type { ProjectDatabaseProject } from "@/types/simulation";

const DEFAULT_PROJECT_DATABASE_PATH =
  "E:\\pm-obsidian\\工作输出\\04-工具模板\\pm-pixel-database\\pm-pixel-project-database.json";

function clean(value: string | null) {
  return (value || "").trim();
}

function comparable(value: string | undefined) {
  return (value || "").replaceAll("\\", "/").toLocaleLowerCase("zh-CN");
}

function projectMatches(project: ProjectDatabaseProject, query: { projectId: string; projectKey: string; projectName: string }) {
  const candidates = [
    project.project_id,
    project.project_name,
    project.source_paths?.homepage,
    project.source_paths?.graph,
    project.source_paths?.derived_state,
  ].map(comparable).filter(Boolean);

  const keys = [query.projectId, query.projectKey, query.projectName].map(comparable).filter(Boolean);
  return keys.some((key) => candidates.some((candidate) => candidate === key || candidate.includes(key) || key.includes(candidate)));
}

async function readProjectDatabase() {
  const databasePath = process.env.PM_PIXEL_PROJECT_DATABASE_PATH || DEFAULT_PROJECT_DATABASE_PATH;
  const content = await readFile(databasePath, "utf8");
  return {
    databasePath,
    database: parseProjectDatabase(JSON.parse(content) as unknown),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = {
    projectId: clean(url.searchParams.get("project_id")),
    projectKey: clean(url.searchParams.get("project_key")),
    projectName: clean(url.searchParams.get("project_name")),
  };

  if (!query.projectId && !query.projectKey && !query.projectName) {
    return NextResponse.json({ ok: false, error: "缺少 project_id、project_key 或 project_name。" }, { status: 400 });
  }

  try {
    const { databasePath, database } = await readProjectDatabase();
    const project = database.projects.find((item) => projectMatches(item, query));

    if (!project) {
      return NextResponse.json({ ok: false, error: "未在 PM Pixel 项目数据库中找到匹配项目。" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      database_path: databasePath,
      database_generated_at: database.generated_at,
      project,
      input: databaseProjectToScenarioInput(project),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "读取项目数据库失败。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

