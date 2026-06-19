import type { AbilityScore } from "@/types/simulation";

interface AbilityScorePanelProps {
  score: AbilityScore;
}

const dimensions: { key: keyof Omit<AbilityScore, "total" | "deductions" | "trainingFocus">; label: string }[] = [
  { key: "globalView", label: "全局视野" },
  { key: "scheduleControl", label: "节点控制" },
  { key: "responsibilityJudgment", label: "责任判断" },
  { key: "coordination", label: "协同推进" },
  { key: "closure", label: "闭环能力" },
  { key: "riskIdentification", label: "风险识别" },
  { key: "evidenceAwareness", label: "证据意识" },
  { key: "reviewAndAssetization", label: "复盘沉淀" },
];

export function AbilityScorePanel({ score }: AbilityScorePanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <div className="grid place-items-center border-2 border-pixel-yellow bg-[#171a22] p-5 text-center shadow-pixelSm">
        <p className="text-sm text-pixel-muted">本次关卡评分</p>
        <p className="mt-2 text-5xl font-black text-pixel-yellow">{score.total}</p>
        <p className="mt-1 text-pixel-muted">/ 100</p>
      </div>
      <div className="grid gap-3">
        {dimensions.map((dimension) => {
          const value = score[dimension.key];
          return (
            <div key={dimension.key} className="grid gap-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-pixel-text">{dimension.label}</span>
                <span className="text-pixel-yellow">{value}</span>
              </div>
              <div className="h-3 border-2 border-pixel-border bg-[#0c1018]">
                <div className="h-full bg-pixel-cyan" style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="lg:col-span-2">
        <h3 className="mb-2 font-bold text-pixel-cyan">主要扣分原因</h3>
        <ul className="grid gap-2 text-sm text-pixel-muted">
          {score.deductions.map((deduction) => (
            <li key={deduction}>{deduction}</li>
          ))}
        </ul>
        <p className="mt-4 border-2 border-pixel-border bg-[#101822] p-3 text-sm text-pixel-text">{score.trainingFocus}</p>
      </div>
    </div>
  );
}
