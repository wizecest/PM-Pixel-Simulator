import type { DecisionFlightRecord, DecisionFlightRecordStep, DecisionFlightStepKey, SimulationRecord } from "@/types/simulation";

export const DECISION_FLIGHT_RECORD_SCHEMA_VERSION = "pm-pixel-decision-flight-record/v1";

const stepDefinitions: Array<{ key: DecisionFlightStepKey; label: string }> = [
  { key: "input_problem", label: "输入问题" },
  { key: "ai_simulation", label: "AI推演" },
  { key: "human_adoption", label: "人工采纳" },
  { key: "real_execution", label: "真实执行" },
  { key: "reality_feedback", label: "现实反馈" },
  { key: "judgment_upgrade", label: "判断升级" },
  { key: "case_asset", label: "案例资产" },
];

function now() {
  return new Date().toISOString();
}

export function buildDecisionFlightRecord(record: SimulationRecord): DecisionFlightRecord {
  const createdAt = now();

  const steps: DecisionFlightRecordStep[] = stepDefinitions.map((s) => {
    let content = "";

    if (s.key === "input_problem") {
      content = `${record.input.projectName}\n${record.input.currentProblem}\n${record.input.proposedAction}`;
    }

    if (s.key === "ai_simulation") {
      content = `${record.levelName}\n${record.mainQuest}\n风险：${record.hiddenRisks.join(",")}`;
    }

    if (s.key === "case_asset") {
      content = `${record.caseAsset.caseName}\n${record.caseAsset.caseType}`;
    }

    return {
      key: s.key,
      label: s.label,
      status: s.key === "input_problem" || s.key === "ai_simulation" || s.key === "case_asset" ? "completed" : "pending",
      content,
      evidence: [],
      updatedAt: createdAt,
    };
  });

  return {
    schemaVersion: DECISION_FLIGHT_RECORD_SCHEMA_VERSION,
    createdAt,
    updatedAt: createdAt,
    steps,
    nextReviewNote: "",
  };
}

export function ensureDecisionFlightRecord(record: SimulationRecord): DecisionFlightRecord {
  // @ts-ignore
  return record.flightRecord || buildDecisionFlightRecord(record);
}

export function flightRecordToMarkdown(record: DecisionFlightRecord): string {
  return [
    "## 决策飞行记录",
    ...record.steps.map(
      (s) => `### ${s.label}\n状态：${s.status}\n\n${s.content || "未填写"}`,
    ),
  ].join("\n\n");
}
