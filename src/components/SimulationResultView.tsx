import { PixelCard } from "@/components/PixelCard";
import { RoleDialogueCard } from "@/components/RoleDialogueCard";
import { GapScanTable } from "@/components/GapScanTable";
import { AbilityScorePanel } from "@/components/AbilityScorePanel";
import { ActionPlanPanel } from "@/components/ActionPlanPanel";
import { CaseAssetPanel } from "@/components/CaseAssetPanel";
import type {
  AbilityScore,
  ActionItem,
  ActionPlan,
  CaseAsset,
  GapScanItem,
  GapScanResult,
  GenerateSimulationResponse,
  RiskLevel,
  RoleSimulationResult,
  SimulationRecord,
  SimulationSource,
} from "@/types/simulation";

type ResultData = GenerateSimulationResponse | SimulationRecord;

interface SimulationResultViewProps {
  result: ResultData;
}

const riskLabels: Record<RiskLevel, string> = {
  low: "低",
  medium: "中",
  medium_high: "中高",
  high: "高",
};

const riskClass: Record<RiskLevel, string> = {
  low: "text-pixel-green",
  medium: "text-pixel-yellow",
  medium_high: "text-pixel-orange",
  high: "text-pixel-red",
};

const sourceLabels: Record<SimulationSource, string> = {
  local_rules: "本地规则",
  live_llm: "大模型接口",
};

const sourceClass: Record<SimulationSource, string> = {
  local_rules: "border-pixel-yellow text-pixel-yellow",
  live_llm: "border-pixel-cyan text-pixel-cyan",
};

const emptyAbilityScore: AbilityScore = {
  globalView: 0,
  scheduleControl: 0,
  responsibilityJudgment: 0,
  coordination: 0,
  closure: 0,
  riskIdentification: 0,
  evidenceAwareness: 0,
  reviewAndAssetization: 0,
  total: 0,
  deductions: [],
  trainingFocus: "未提供训练重点。",
};

const emptyActionPlan: ActionPlan = {
  todayActions: [],
  tomorrowActions: [],
  weeklyActions: [],
  participants: [],
  requiredForms: [],
  deliverables: [],
  reportingRequirement: "未提供上报要求。",
  closureMethod: "未提供销项方式。",
};

const emptyCaseAsset: CaseAsset = {
  caseName: "未命名案例",
  caseType: "未归类",
  exposedProblems: [],
  reusableTemplates: [],
  aiWorkflows: [],
  suitableForTraining: false,
  suitableForContent: false,
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function safeGapScan(gapScan: Partial<GapScanResult> | undefined): GapScanResult {
  return {
    items: asArray<GapScanItem>(gapScan?.items),
  };
}

function safeAbilityScore(score: Partial<AbilityScore> | undefined): AbilityScore {
  return {
    globalView: asScore(score?.globalView),
    scheduleControl: asScore(score?.scheduleControl),
    responsibilityJudgment: asScore(score?.responsibilityJudgment),
    coordination: asScore(score?.coordination),
    closure: asScore(score?.closure),
    riskIdentification: asScore(score?.riskIdentification),
    evidenceAwareness: asScore(score?.evidenceAwareness),
    reviewAndAssetization: asScore(score?.reviewAndAssetization),
    total: asScore(score?.total),
    deductions: asArray<string>(score?.deductions),
    trainingFocus: asText(score?.trainingFocus, emptyAbilityScore.trainingFocus),
  };
}

function safeActionPlan(actionPlan: Partial<ActionPlan> | undefined): ActionPlan {
  return {
    ...emptyActionPlan,
    ...actionPlan,
    todayActions: asArray<ActionItem>(actionPlan?.todayActions),
    tomorrowActions: asArray<ActionItem>(actionPlan?.tomorrowActions),
    weeklyActions: asArray<ActionItem>(actionPlan?.weeklyActions),
    participants: asArray<string>(actionPlan?.participants),
    requiredForms: asArray<string>(actionPlan?.requiredForms),
    deliverables: asArray<string>(actionPlan?.deliverables),
    reportingRequirement: asText(actionPlan?.reportingRequirement, emptyActionPlan.reportingRequirement),
    closureMethod: asText(actionPlan?.closureMethod, emptyActionPlan.closureMethod),
  };
}

function safeCaseAsset(caseAsset: Partial<CaseAsset> | undefined): CaseAsset {
  return {
    ...emptyCaseAsset,
    ...caseAsset,
    caseName: caseAsset?.caseName || emptyCaseAsset.caseName,
    caseType: caseAsset?.caseType || emptyCaseAsset.caseType,
    exposedProblems: asArray<string>(caseAsset?.exposedProblems),
    reusableTemplates: asArray<string>(caseAsset?.reusableTemplates),
    aiWorkflows: asArray<string>(caseAsset?.aiWorkflows),
    suitableForTraining: typeof caseAsset?.suitableForTraining === "boolean" ? caseAsset.suitableForTraining : false,
    suitableForContent: typeof caseAsset?.suitableForContent === "boolean" ? caseAsset.suitableForContent : false,
  };
}

export function SimulationResultView({ result }: SimulationResultViewProps) {
  const source = result.simulationSource ?? "local_rules";
  const riskLevel = riskLabels[result.riskLevel] ? result.riskLevel : "medium";
  const hiddenRisks = asArray<string>(result.hiddenRisks);
  const roleResults = asArray<RoleSimulationResult>(result.roleResults);
  const gapScan = safeGapScan(result.gapScan);
  const abilityScore = safeAbilityScore(result.abilityScore);
  const actionPlan = safeActionPlan(result.actionPlan);
  const caseAsset = safeCaseAsset(result.caseAsset);
  const caseOutputSource =
    "input" in result
      ? {
          projectName: result.input?.projectName,
          currentProblem: result.input?.currentProblem,
          proposedAction: result.input?.proposedAction,
          involvedParties: result.input?.involvedParties,
        }
      : undefined;

  return (
    <div className="grid gap-6">
      <PixelCard title="关卡生成" eyebrow="LEVEL">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-pixel-yellow">{result.levelName}</h2>
              <span className={`border-2 px-2 py-1 text-xs font-bold ${sourceClass[source]}`}>
                推演来源：{sourceLabels[source]}
              </span>
            </div>
            <p className="mt-3 leading-7 text-pixel-text">{result.mainQuest || "未提供主线任务。"}</p>
          </div>
          <div className="border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm">
            <p className="text-sm text-pixel-muted">风险等级</p>
            <p className={`mt-2 text-3xl font-black ${riskClass[riskLevel]}`}>{riskLabels[riskLevel]}</p>
          </div>
        </div>
        <div className="mt-5">
          <h3 className="mb-2 font-bold text-pixel-cyan">隐藏风险</h3>
          <div className="flex flex-wrap gap-2">
            {hiddenRisks.length === 0 ? (
              <span className="border-2 border-pixel-border bg-[#111926] px-3 py-2 text-sm text-pixel-muted">暂无隐藏风险</span>
            ) : (
              hiddenRisks.map((risk) => (
                <span key={risk} className="border-2 border-pixel-border bg-[#111926] px-3 py-2 text-sm text-pixel-muted">
                  {risk}
                </span>
              ))
            )}
          </div>
        </div>
      </PixelCard>

      <div className="grid gap-4">
        {roleResults.map((roleResult, index) => (
          <RoleDialogueCard key={roleResult.roleId || roleResult.roleName || index} result={roleResult} />
        ))}
      </div>

      <PixelCard title="管理漏洞扫描" eyebrow="GAP SCAN">
        <GapScanTable gapScan={gapScan} />
      </PixelCard>

      <PixelCard title="能力评分" eyebrow="SCORE">
        <AbilityScorePanel score={abilityScore} />
      </PixelCard>

      <PixelCard title="通关方案" eyebrow="ACTION PLAN">
        <ActionPlanPanel actionPlan={actionPlan} />
      </PixelCard>

      <PixelCard title="案例沉淀" eyebrow="CASE ASSET">
        <CaseAssetPanel caseAsset={caseAsset} source={caseOutputSource} />
      </PixelCard>
    </div>
  );
}
