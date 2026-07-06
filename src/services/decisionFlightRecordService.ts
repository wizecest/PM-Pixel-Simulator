import type {
  ActionItem,
  DecisionFlightRecord,
  DecisionFlightRecordStep,
  DecisionFlightStepKey,
  DecisionFlightStepStatus,
  GapScanItem,
  RoleSimulationResult,
  SimulationRecord,
} from "@/types/simulation";

export const DECISION_FLIGHT_STEP_DEFINITIONS: ReadonlyArray<{
  key: DecisionFlightStepKey;
  label: string;
}> = [
  { key: "input_problem", label: "输入问题" },
  { key: "ai_simulation", label: "AI 推演" },
  { key: "human_adoption", label: "人工采纳" },
  { key: "real_execution", label: "真实执行" },
  { key: "reality_feedback", label: "现实反馈" },
  { key: "judgment_upgrade", label: "判断升级" },
  { key: "case_asset", label: "案例资产" },
];

export const DECISION_FLIGHT_REQUIRED_KEYS: ReadonlyArray<DecisionFlightStepKey> = [
  "input_problem",
  "ai_simulation",
  "human_adoption",
  "real_execution",
  "reality_feedback",
  "judgment_upgrade",
];

export const decisionFlightStatusLabels: Record<DecisionFlightStepStatus, string> = {
  pending: "未开始",
  in_progress: "进行中",
  completed: "已完成",
};

export type DecisionFlightStepPatch = Partial<Pick<DecisionFlightRecordStep, "status" | "content" | "evidence">>;

const schemaVersion: DecisionFlightRecord["schemaVersion"] = "pm-pixel-decision-flight-record/v1";
const validStatuses: DecisionFlightStepStatus[] = ["pending", "in_progress", "completed"];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function bulletList(items: string[]) {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);
  return cleanItems.length > 0 ? cleanItems.map((item) => `- ${item}`).join("\n") : "- 暂无";
}

function countLabel(label: string, items: unknown) {
  return `${label}：${asArray<unknown>(items).length} 项`;
}

function buildInputProblemContent(record: SimulationRecord) {
  const input = record.input;
  const lines = [
    `项目名称：${asText(input?.projectName, "未填写")}`,
    `当前问题：${asText(input?.currentProblem, "未填写")}`,
    `原推进方案：${asText(input?.proposedAction, "未填写")}`,
  ];

  if (asText(input?.involvedParties)) {
    lines.push(`涉及方：${asText(input.involvedParties)}`);
  }

  return lines.join("\n");
}

function buildAiSimulationContent(record: SimulationRecord) {
  const roles = asArray<Partial<RoleSimulationResult>>(record.roleResults).map((role) => {
    const roleName = asText(role.roleName, "未命名角色");
    const challenges = asArray<string>(role.challenges).slice(0, 3).join("；");
    return `${roleName}：${challenges || asText(role.npcLine, "暂无质疑摘要")}`;
  });
  const gaps = asArray<Partial<GapScanItem>>(record.gapScan?.items).map((item) => {
    const label = asText(item.label, "未命名检查项");
    const problem = asText(item.problem, "暂无问题摘要");
    return `${label}：${problem}`;
  });
  const todayActions = asArray<Partial<ActionItem>>(record.actionPlan?.todayActions);
  const tomorrowActions = asArray<Partial<ActionItem>>(record.actionPlan?.tomorrowActions);
  const weeklyActions = asArray<Partial<ActionItem>>(record.actionPlan?.weeklyActions);

  return [
    `关卡名称：${asText(record.levelName, "未生成")}`,
    `主线任务：${asText(record.mainQuest, "未生成")}`,
    "隐藏风险：",
    bulletList(asArray<string>(record.hiddenRisks)),
    "角色质疑摘要：",
    bulletList(roles),
    "管理漏洞摘要：",
    bulletList(gaps),
    "行动方案摘要：",
    `- ${countLabel("今天行动", todayActions)}`,
    `- ${countLabel("明天行动", tomorrowActions)}`,
    `- ${countLabel("本周行动", weeklyActions)}`,
    `- 交付物：${asArray<string>(record.actionPlan?.deliverables).join("；") || "暂无"}`,
  ].join("\n");
}

function buildCaseAssetContent(record: SimulationRecord) {
  const asset = record.caseAsset;
  return [
    `案例名称：${asText(asset?.caseName, "未命名案例")}`,
    `案例类型：${asText(asset?.caseType, "未分类")}`,
    "暴露问题：",
    bulletList(asArray<string>(asset?.exposedProblems)),
  ].join("\n");
}

function initialStepStatus(key: DecisionFlightStepKey): DecisionFlightStepStatus {
  if (key === "input_problem" || key === "ai_simulation") {
    return "completed";
  }
  if (key === "case_asset") {
    return "in_progress";
  }
  return "pending";
}

function initialStepContent(record: SimulationRecord, key: DecisionFlightStepKey) {
  if (key === "input_problem") {
    return buildInputProblemContent(record);
  }
  if (key === "ai_simulation") {
    return buildAiSimulationContent(record);
  }
  if (key === "case_asset") {
    return buildCaseAssetContent(record);
  }
  return "";
}

function findDefaultStep(record: DecisionFlightRecord, key: DecisionFlightStepKey) {
  return record.steps.find((step) => step.key === key);
}

function normalizeStatus(value: unknown, fallback: DecisionFlightStepStatus): DecisionFlightStepStatus {
  return validStatuses.includes(value as DecisionFlightStepStatus) ? (value as DecisionFlightStepStatus) : fallback;
}

function isDecisionFlightRecord(value: SimulationRecord | DecisionFlightRecord): value is DecisionFlightRecord {
  return "schemaVersion" in value && "steps" in value;
}

function getProgressFromFlightRecord(flightRecord: DecisionFlightRecord) {
  const completed = flightRecord.steps.filter((step) => step.status === "completed").length;
  const missingRequiredKeys = DECISION_FLIGHT_REQUIRED_KEYS.filter(
    (key) => flightRecord.steps.find((step) => step.key === key)?.status !== "completed",
  );
  const missingRequiredLabels = missingRequiredKeys.map(
    (key) => DECISION_FLIGHT_STEP_DEFINITIONS.find((step) => step.key === key)?.label ?? key,
  );

  return {
    completed,
    total: flightRecord.steps.length,
    canEnterCaseAsset: missingRequiredKeys.length === 0,
    missingRequiredKeys,
    missingRequiredLabels,
  };
}

export function buildDecisionFlightRecord(record: SimulationRecord): DecisionFlightRecord {
  const now = new Date().toISOString();
  const createdAt = asText(record.createdAt, now);

  return {
    schemaVersion,
    createdAt,
    updatedAt: now,
    steps: DECISION_FLIGHT_STEP_DEFINITIONS.map((step) => ({
      key: step.key,
      label: step.label,
      status: initialStepStatus(step.key),
      content: initialStepContent(record, step.key),
      evidence: [],
      updatedAt: now,
    })),
    nextReviewNote: "补充人工采纳、真实执行、现实反馈和判断升级后，再判断是否沉淀为案例资产。",
  };
}

export function ensureDecisionFlightRecord(record: SimulationRecord): DecisionFlightRecord {
  const fallbackRecord = buildDecisionFlightRecord(record);
  const currentRecord = record.flightRecord;

  if (!currentRecord) {
    return fallbackRecord;
  }

  const currentSteps = asArray<Partial<DecisionFlightRecordStep>>(currentRecord.steps);
  const steps = DECISION_FLIGHT_STEP_DEFINITIONS.map((definition) => {
    const fallbackStep = findDefaultStep(fallbackRecord, definition.key);
    const currentStep = currentSteps.find((step) => step.key === definition.key);

    if (!fallbackStep) {
      throw new Error(`Missing decision flight step: ${definition.key}`);
    }

    if (!currentStep) {
      return fallbackStep;
    }

    return {
      key: definition.key,
      label: asText(currentStep.label, definition.label),
      status: normalizeStatus(currentStep.status, fallbackStep.status),
      content: typeof currentStep.content === "string" ? currentStep.content : fallbackStep.content,
      evidence: asArray<unknown>(currentStep.evidence).map((item) => asText(item)).filter(Boolean),
      updatedAt: asText(currentStep.updatedAt, fallbackStep.updatedAt),
    };
  });

  return {
    schemaVersion,
    createdAt: asText(currentRecord.createdAt, fallbackRecord.createdAt),
    updatedAt: asText(currentRecord.updatedAt, fallbackRecord.updatedAt),
    steps,
    nextReviewNote: asText(currentRecord.nextReviewNote, fallbackRecord.nextReviewNote),
  };
}

export function updateDecisionFlightStep(
  record: SimulationRecord,
  key: DecisionFlightStepKey,
  patch: DecisionFlightStepPatch,
): SimulationRecord {
  const now = new Date().toISOString();
  const flightRecord = ensureDecisionFlightRecord(record);
  const steps = flightRecord.steps.map((step) => {
    if (step.key !== key) {
      return step;
    }

    return {
      ...step,
      status: patch.status ?? step.status,
      content: patch.content ?? step.content,
      evidence: patch.evidence ?? step.evidence,
      updatedAt: now,
    };
  });

  return {
    ...record,
    flightRecord: {
      ...flightRecord,
      updatedAt: now,
      steps,
    },
  };
}

export function getDecisionFlightProgress(record: SimulationRecord) {
  return getProgressFromFlightRecord(ensureDecisionFlightRecord(record));
}

export function flightRecordToMarkdown(recordOrFlightRecord: SimulationRecord | DecisionFlightRecord) {
  const flightRecord = isDecisionFlightRecord(recordOrFlightRecord)
    ? recordOrFlightRecord
    : ensureDecisionFlightRecord(recordOrFlightRecord);
  const progress = getProgressFromFlightRecord(flightRecord);
  const gateMessage = progress.canEnterCaseAsset
    ? "该案例已具备进入案例资产库的基础条件，仍需人工脱敏和复核。"
    : "该案例仍缺少真实执行 / 现实反馈 / 判断升级记录，暂不建议进入案例资产。";
  const stepSections = flightRecord.steps
    .map(
      (step, index) => `### ${index + 1}. ${step.label}

- 状态：${decisionFlightStatusLabels[step.status]}
- 更新时间：${step.updatedAt}

#### 记录内容

${step.content || "暂无"}

#### 证据

${step.evidence.length > 0 ? bulletList(step.evidence) : "- 暂无"}`,
    )
    .join("\n\n");

  return `- 创建时间：${flightRecord.createdAt}
- 更新时间：${flightRecord.updatedAt}
- 完成进度：${progress.completed} / ${progress.total}
- 案例资产闸门：${gateMessage}
- 下次复盘提示：${flightRecord.nextReviewNote || "暂无"}

${stepSections}`;
}
