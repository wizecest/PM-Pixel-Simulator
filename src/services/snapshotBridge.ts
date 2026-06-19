import type {
  ActionItem,
  GenerateSimulationResponse,
  ProjectActionPack,
  ProjectDatabase,
  ProjectDatabaseProject,
  ProjectIssueSnapshot,
  ProjectStage,
  ScenarioInput,
  SimulationRecord,
} from "@/types/simulation";

export const PROJECT_SNAPSHOT_SCHEMA_VERSION = "pm-pixel-snapshot/v1";
export const PROJECT_DATABASE_SCHEMA_VERSION = "pm-pixel-project-database/v1";
export const ACTION_PACK_SCHEMA_VERSION = "pm-pixel-action-pack/v1";

type JsonObject = Record<string, unknown>;
type ActionPackResult = GenerateSimulationResponse | SimulationRecord;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(record: JsonObject, field: string) {
  const value = record[field];
  if (typeof value !== "string") {
    throw new Error(`${field} 必须是字符串。`);
  }

  return value.trim();
}

function readStringArray(record: JsonObject, field: string) {
  const value = record[field];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${field} 必须是字符串数组。`);
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
}

function numberedList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function inferProjectStage(snapshot: ProjectIssueSnapshot): ProjectStage {
  const text = `${snapshot.current_node}\n${snapshot.node_status}\n${snapshot.risk_note}\n${snapshot.user_question}`;
  const rules: Array<[ProjectStage, RegExp]> = [
    ["planning", /策划|立项|储备|谋划/],
    ["feasibility", /可研|可行性研究/],
    ["scheme_design", /方案设计|方案/],
    ["preliminary_design", /初设|初步设计/],
    ["construction_drawing", /施工图/],
    ["procurement", /招采|采购|招标/],
    ["construction", /施工|现场/],
    ["acceptance", /验收/],
    ["settlement", /结算|决算/],
  ];

  return rules.find(([, pattern]) => pattern.test(text))?.[0] ?? "other";
}

function buildCurrentProblem(snapshot: ProjectIssueSnapshot) {
  const lines = [
    `当前节点：${snapshot.current_node || "未填写"}`,
    `节点状态：${snapshot.node_status || "未填写"}`,
    `风险提示：${snapshot.risk_note || "未填写"}`,
  ];

  if (snapshot.latest_events.length > 0) {
    lines.push(`最近事件：\n${numberedList(snapshot.latest_events)}`);
  }

  if (snapshot.user_question) {
    lines.push(`用户问题：${snapshot.user_question}`);
  }

  return lines.join("\n\n");
}

function buildProposedAction(snapshot: ProjectIssueSnapshot) {
  if (snapshot.pending_actions.length > 0) {
    return numberedList(snapshot.pending_actions);
  }

  return snapshot.user_question || "请基于项目快照输出可执行的下一步行动建议。";
}

function flattenActions(result: ActionPackResult) {
  return [
    ...result.actionPlan.todayActions,
    ...result.actionPlan.tomorrowActions,
    ...result.actionPlan.weeklyActions,
  ];
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function formatAction(item: ActionItem) {
  return `${item.action}（责任人：${item.owner}；完成时间：${item.deadline}；输出：${item.output}；检查人：${item.checker}）`;
}

function evidenceText(result: ActionPackResult) {
  const gapEvidence = result.gapScan.items
    .map((item) => item.improvementAction)
    .filter((item) => /纪要|清单|台账|表|报告|附件|版本|记录|归档|证据|书面/.test(item));

  return unique([...result.actionPlan.requiredForms, ...result.actionPlan.deliverables, ...gapEvidence]);
}

export function parseProjectIssueSnapshot(value: unknown): ProjectIssueSnapshot {
  if (!isObject(value)) {
    throw new Error("快照根节点必须是 JSON 对象。");
  }

  const source = readString(value, "source");
  if (source !== "pm-obsidian") {
    throw new Error("source 必须是 pm-obsidian。");
  }

  const schemaVersion = readString(value, "schema_version");
  if (schemaVersion !== PROJECT_SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`schema_version 必须是 ${PROJECT_SNAPSHOT_SCHEMA_VERSION}。`);
  }

  return {
    source,
    schema_version: schemaVersion,
    generated_at: readString(value, "generated_at"),
    project_id: readString(value, "project_id"),
    project_name: readString(value, "project_name"),
    current_node: readString(value, "current_node"),
    node_status: readString(value, "node_status"),
    risk_note: readString(value, "risk_note"),
    latest_events: readStringArray(value, "latest_events"),
    pending_actions: readStringArray(value, "pending_actions"),
    evidence_links: readStringArray(value, "evidence_links"),
    user_question: readString(value, "user_question"),
  };
}

export function parseProjectDatabase(value: unknown): ProjectDatabase {
  if (!isObject(value)) {
    throw new Error("数据库根节点必须是 JSON 对象。");
  }

  const source = readString(value, "source");
  if (source !== "pm-obsidian") {
    throw new Error("source 必须是 pm-obsidian。");
  }

  const schemaVersion = readString(value, "schema_version");
  if (schemaVersion !== PROJECT_DATABASE_SCHEMA_VERSION) {
    throw new Error(`schema_version 必须是 ${PROJECT_DATABASE_SCHEMA_VERSION}。`);
  }

  const projects = value.projects;
  if (!Array.isArray(projects)) {
    throw new Error("projects 必须是数组。");
  }

  for (const project of projects) {
    if (!isObject(project)) {
      throw new Error("projects 内每一项必须是对象。");
    }
    readString(project, "project_id");
    readString(project, "project_name");
    if (!isObject(project.current_state)) {
      throw new Error("projects 内每一项必须包含 current_state 对象。");
    }
    readString(project.current_state, "current_node");
    parseProjectIssueSnapshot(project.simulator_snapshot);
  }

  return value as unknown as ProjectDatabase;
}

export function databaseProjectToScenarioInput(project: ProjectDatabaseProject): ScenarioInput {
  return snapshotToScenarioInput(parseProjectIssueSnapshot(project.simulator_snapshot));
}

export function snapshotToScenarioInput(snapshot: ProjectIssueSnapshot): ScenarioInput {
  return {
    id: createId(),
    projectName: snapshot.project_name || snapshot.project_id || "未命名项目",
    projectStage: inferProjectStage(snapshot),
    currentProblem: buildCurrentProblem(snapshot),
    proposedAction: buildProposedAction(snapshot),
    trainingGoals: ["节点控制", "闭环能力", "证据意识", "风险识别"],
    sourceSnapshot: {
      source: snapshot.source,
      schemaVersion: snapshot.schema_version,
      generatedAt: snapshot.generated_at,
      projectId: snapshot.project_id,
      currentNode: snapshot.current_node,
      nodeStatus: snapshot.node_status,
      riskNote: snapshot.risk_note,
      latestEvents: snapshot.latest_events,
      pendingActions: snapshot.pending_actions,
      evidenceLinks: snapshot.evidence_links,
      userQuestion: snapshot.user_question,
    },
    createdAt: new Date().toISOString(),
  };
}

export function buildActionPack(input: ScenarioInput, result: ActionPackResult): ProjectActionPack {
  const managementGaps = result.gapScan.items
    .filter((item) => item.status !== "pass")
    .map((item) => `${item.label}：${item.problem} 补强动作：${item.improvementAction}`);
  const roleChallenges = result.roleResults.flatMap((role) =>
    role.challenges.map((challenge) => `${role.roleName}：${challenge}`),
  );
  const recommendedActions = flattenActions(result).map(formatAction);

  return {
    source: "pm-pixel-simulator",
    schema_version: ACTION_PACK_SCHEMA_VERSION,
    project_id: input.sourceSnapshot?.projectId ?? "",
    project_name: input.projectName,
    management_gaps: managementGaps,
    role_challenges: roleChallenges,
    recommended_actions: recommendedActions,
    owner_suggestions: unique(flattenActions(result).map((item) => item.owner)),
    deadline_suggestions: unique(flattenActions(result).map((item) => item.deadline)),
    evidence_needed: evidenceText(result),
    writeback_candidates: unique([
      ...managementGaps.map((item) => `人工确认后可回填为问题/风险记录：${item}`),
      ...recommendedActions.map((item) => `人工确认后可回填为待办动作：${item}`),
    ]),
  };
}
