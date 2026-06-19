import { caseQualityStatusLabels } from "@/services/caseQualityService";
import type { CaseQualityReport, CaseQualityStatus } from "@/types/simulation";

interface CaseQualityPanelProps {
  report: CaseQualityReport;
}

const statusClass: Record<CaseQualityStatus, string> = {
  pass: "border-pixel-green text-pixel-green",
  warning: "border-pixel-yellow text-pixel-yellow",
  fail: "border-pixel-red text-pixel-red",
};

export function CaseQualityPanel({ report }: CaseQualityPanelProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className={`border-2 bg-[#101822] p-4 text-center shadow-pixelSm ${statusClass[report.overallStatus]}`}>
          <p className="text-xs font-bold">核查状态</p>
          <p className="mt-2 text-2xl font-black">{caseQualityStatusLabels[report.overallStatus]}</p>
          <p className="mt-1 text-sm text-pixel-muted">{report.score} / 100</p>
        </div>
        <div className="border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm">
          <h3 className="mb-2 font-bold text-pixel-cyan">人工复核提醒</h3>
          {report.warnings.length === 0 ? (
            <p className="text-sm text-pixel-muted">暂无需要人工复核的问题。</p>
          ) : (
            <ul className="grid gap-2 text-sm text-pixel-muted">
              {report.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {report.checks.map((check) => (
          <article key={check.key} className="border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-pixel-yellow">{check.label}</h3>
              <span className={`border-2 px-2 py-1 text-xs font-bold ${statusClass[check.status]}`}>
                {caseQualityStatusLabels[check.status]} · {check.score}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-pixel-text">{check.summary}</p>
            {check.details.length > 0 && (
              <ul className="mt-3 grid gap-2 text-sm text-pixel-muted">
                {check.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
