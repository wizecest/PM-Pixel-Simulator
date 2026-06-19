import { PixelCard } from "@/components/PixelCard";
import { RoleDialogueCard } from "@/components/RoleDialogueCard";
import { GapScanTable } from "@/components/GapScanTable";
import { AbilityScorePanel } from "@/components/AbilityScorePanel";
import { ActionPlanPanel } from "@/components/ActionPlanPanel";
import { CaseAssetPanel } from "@/components/CaseAssetPanel";
import type { GenerateSimulationResponse, RiskLevel, SimulationRecord, SimulationSource } from "@/types/simulation";

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

export function SimulationResultView({ result }: SimulationResultViewProps) {
  const source = result.simulationSource ?? "local_rules";
  const caseOutputSource =
    "input" in result
      ? {
          projectName: result.input.projectName,
          currentProblem: result.input.currentProblem,
          proposedAction: result.input.proposedAction,
          involvedParties: result.input.involvedParties,
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
            <p className="mt-3 leading-7 text-pixel-text">{result.mainQuest}</p>
          </div>
          <div className="border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm">
            <p className="text-sm text-pixel-muted">风险等级</p>
            <p className={`mt-2 text-3xl font-black ${riskClass[result.riskLevel]}`}>{riskLabels[result.riskLevel]}</p>
          </div>
        </div>
        <div className="mt-5">
          <h3 className="mb-2 font-bold text-pixel-cyan">隐藏风险</h3>
          <div className="flex flex-wrap gap-2">
            {result.hiddenRisks.map((risk) => (
              <span key={risk} className="border-2 border-pixel-border bg-[#111926] px-3 py-2 text-sm text-pixel-muted">
                {risk}
              </span>
            ))}
          </div>
        </div>
      </PixelCard>

      <div className="grid gap-4">
        {result.roleResults.map((roleResult) => (
          <RoleDialogueCard key={roleResult.roleId} result={roleResult} />
        ))}
      </div>

      <PixelCard title="管理漏洞扫描" eyebrow="GAP SCAN">
        <GapScanTable gapScan={result.gapScan} />
      </PixelCard>

      <PixelCard title="能力评分" eyebrow="SCORE">
        <AbilityScorePanel score={result.abilityScore} />
      </PixelCard>

      <PixelCard title="通关方案" eyebrow="ACTION PLAN">
        <ActionPlanPanel actionPlan={result.actionPlan} />
      </PixelCard>

      <PixelCard title="案例沉淀" eyebrow="CASE ASSET">
        <CaseAssetPanel caseAsset={result.caseAsset} source={caseOutputSource} />
      </PixelCard>
    </div>
  );
}
