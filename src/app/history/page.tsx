"use client";

import { ArrowLeft, Eye, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { deleteRecord, getRecords } from "@/services/storageService";
import type { ProjectStage, SimulationRecord, SimulationSource } from "@/types/simulation";

const stageLabels: Record<ProjectStage, string> = {
  planning: "前期策划",
  feasibility: "可研",
  scheme_design: "方案设计",
  preliminary_design: "初设",
  construction_drawing: "施工图",
  procurement: "招采",
  construction: "施工",
  acceptance: "验收",
  settlement: "结算",
  other: "其他",
};

const stageOptions: { value: "all" | ProjectStage; label: string }[] = [
  { value: "all", label: "全部阶段" },
  { value: "planning", label: "前期策划" },
  { value: "feasibility", label: "可研" },
  { value: "scheme_design", label: "方案设计" },
  { value: "preliminary_design", label: "初设" },
  { value: "construction_drawing", label: "施工图" },
  { value: "procurement", label: "招采" },
  { value: "construction", label: "施工" },
  { value: "acceptance", label: "验收" },
  { value: "settlement", label: "结算" },
  { value: "other", label: "其他" },
];

const sourceLabels: Record<SimulationSource, string> = {
  local_rules: "本地规则",
  live_llm: "大模型接口",
};

const sourceOptions: { value: "all" | SimulationSource; label: string }[] = [
  { value: "all", label: "全部来源" },
  { value: "live_llm", label: "大模型接口" },
  { value: "local_rules", label: "本地规则" },
];

function sourceOf(record: SimulationRecord): SimulationSource {
  return record.simulationSource ?? "local_rules";
}

function recordMatchesSearch(record: SimulationRecord, keyword: string) {
  if (!keyword) {
    return true;
  }

  const text = [
    record.levelName,
    record.input.projectName,
    record.input.currentProblem,
    record.input.proposedAction,
    record.input.involvedParties,
    record.caseAsset.caseName,
    record.caseAsset.caseType,
    ...record.caseAsset.exposedProblems,
    ...record.caseAsset.reusableTemplates,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  return text.includes(keyword.toLowerCase());
}

export default function HistoryPage() {
  const [records, setRecords] = useState<SimulationRecord[]>([]);
  const [keyword, setKeyword] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | ProjectStage>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | SimulationSource>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch(() => setError("读取历史案例失败，无法打开本地案例库文件。"));
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteRecord(id);
      setRecords(await getRecords());
    } catch {
      setError("删除失败，无法写入本地案例库文件。");
    }
  }

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const stageMatched = stageFilter === "all" || record.input.projectStage === stageFilter;
        const sourceMatched = sourceFilter === "all" || sourceOf(record) === sourceFilter;
        return stageMatched && sourceMatched && recordMatchesSearch(record, keyword.trim());
      }),
    [keyword, records, sourceFilter, stageFilter],
  );

  const sourceSummary = useMemo(
    () => ({
      live: records.filter((record) => sourceOf(record) === "live_llm").length,
      local: records.filter((record) => sourceOf(record) === "local_rules").length,
    }),
    [records],
  );

  const hasActiveFilter = Boolean(keyword.trim()) || stageFilter !== "all" || sourceFilter !== "all";

  function clearFilters() {
    setKeyword("");
    setStageFilter("all");
    setSourceFilter("all");
  }

  return (
    <PixelLayout>
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-pixel-cyan hover:text-pixel-yellow">
          <ArrowLeft size={16} />
          返回首页
        </Link>
      </div>

      <PixelCard title="历史案例" eyebrow="HISTORY">
        {error && <p className="mb-4 border-2 border-pixel-red bg-[#2a171a] px-3 py-2 text-sm text-pixel-red">{error}</p>}
        <div className="mb-5 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">全部案例</p>
              <p className="mt-1 text-2xl font-black text-pixel-yellow">{records.length}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">大模型接口</p>
              <p className="mt-1 text-2xl font-black text-pixel-cyan">{sourceSummary.live}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">本地规则</p>
              <p className="mt-1 text-2xl font-black text-pixel-yellow">{sourceSummary.local}</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <label className="grid gap-2">
              <span className="field-label">搜索案例</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pixel-muted" size={16} />
                <input
                  className="pixel-input pl-10"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="项目名、问题、模板、暴露问题"
                />
              </span>
            </label>

            <label className="grid gap-2">
              <span className="field-label">项目阶段</span>
              <select
                className="pixel-input"
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value as "all" | ProjectStage)}
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="field-label">推演来源</span>
              <select
                className="pixel-input"
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value as "all" | SimulationSource)}
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <PixelButton type="button" variant="secondary" icon={<X size={16} />} onClick={clearFilters} disabled={!hasActiveFilter}>
                清空
              </PixelButton>
            </div>
          </div>

          <p className="text-sm text-pixel-muted">
            当前显示 <span className="font-bold text-pixel-yellow">{filteredRecords.length}</span> / {records.length} 个案例
          </p>
        </div>

        {records.length === 0 ? (
          <p className="text-pixel-muted">暂无历史案例。</p>
        ) : filteredRecords.length === 0 ? (
          <p className="border-2 border-pixel-border bg-[#101822] p-4 text-pixel-muted">没有符合当前条件的案例。</p>
        ) : (
          <div className="grid gap-3">
            {filteredRecords.map((record) => (
              <article
                key={record.id}
                className="grid gap-4 border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm md:grid-cols-[1fr_auto]"
              >
                <div>
                  <h2 className="text-lg font-bold text-pixel-yellow">{record.levelName}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="border-2 border-pixel-border px-2 py-1 text-pixel-muted">{stageLabels[record.input.projectStage]}</span>
                    <span className="border-2 border-pixel-cyan px-2 py-1 text-pixel-cyan">{sourceLabels[sourceOf(record)]}</span>
                    <span className="border-2 border-pixel-border px-2 py-1 text-pixel-muted">{record.caseAsset.caseType}</span>
                  </div>
                  <p className="mt-3 text-sm text-pixel-muted">{record.input.projectName}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-pixel-text">{record.input.currentProblem}</p>
                  <p className="mt-2 text-xs text-pixel-muted">{new Date(record.createdAt).toLocaleString("zh-CN")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Link className="pixel-link-button" href={`/history/${record.id}`}>
                    <Eye size={16} />
                    打开
                  </Link>
                  <PixelButton type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)}>
                    删除
                  </PixelButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </PixelCard>
    </PixelLayout>
  );
}
