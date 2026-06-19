"use client";

import { ArrowLeft, Eye, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { libraryValueLabels, normalizeCaseLibraryMeta } from "@/services/caseLibraryService";
import { auditCaseQuality, caseQualityStatusLabels } from "@/services/caseQualityService";
import { deleteRecord, getRecords, saveRecord } from "@/services/storageService";
import type {
  CaseLibraryMeta,
  CaseQualityReport,
  CaseQualityStatus,
  CaseReviewStatus,
  LibraryValueLevel,
  ProjectStage,
  SimulationRecord,
  SimulationSource,
} from "@/types/simulation";

type EnrichedRecord = {
  record: SimulationRecord;
  libraryMeta: CaseLibraryMeta;
  qualityReport: CaseQualityReport;
};

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

const trainingValueOptions: { value: "all" | LibraryValueLevel; label: string }[] = [
  { value: "all", label: "全部培训价值" },
  { value: "high", label: "高培训价值" },
  { value: "medium", label: "中培训价值" },
  { value: "low", label: "低培训价值" },
];

const reviewStatusLabels: Record<CaseReviewStatus, string> = {
  unreviewed: "未复核",
  approved: "已确认可培训",
  needs_edit: "需要人工修改",
};

const reviewStatusOptions: { value: CaseReviewStatus; label: string }[] = [
  { value: "unreviewed", label: "未复核" },
  { value: "approved", label: "已确认可培训" },
  { value: "needs_edit", label: "需要人工修改" },
];

const qualityStatusClass: Record<CaseQualityStatus, string> = {
  pass: "border-pixel-green text-pixel-green",
  warning: "border-pixel-yellow text-pixel-yellow",
  fail: "border-pixel-red text-pixel-red",
};

const reviewStatusClass: Record<CaseReviewStatus, string> = {
  unreviewed: "border-pixel-border text-pixel-muted",
  approved: "border-pixel-green text-pixel-green",
  needs_edit: "border-pixel-yellow text-pixel-yellow",
};

function sourceOf(record: SimulationRecord): SimulationSource {
  return record.simulationSource ?? "local_rules";
}

function reviewStatusOf(record: SimulationRecord): CaseReviewStatus {
  return record.reviewStatus ?? "unreviewed";
}

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function LibraryTags({ label, tags }: { label: string; tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-pixel-muted">{label}</span>
      {tags.slice(0, 4).map((tag) => (
        <span key={`${label}-${tag}`} className="border-2 border-pixel-border bg-[#0d131c] px-2 py-1 text-pixel-text">
          {tag}
        </span>
      ))}
    </div>
  );
}

function recordMatchesSearch(record: SimulationRecord, libraryMeta: CaseLibraryMeta, keyword: string) {
  if (!keyword) {
    return true;
  }

  const caseAsset = record.caseAsset;
  const text = [
    record.levelName,
    record.input?.projectName,
    record.input?.currentProblem,
    record.input?.proposedAction,
    record.input?.involvedParties,
    caseAsset?.caseName,
    caseAsset?.caseType,
    ...(caseAsset?.exposedProblems ?? []),
    ...(caseAsset?.reusableTemplates ?? []),
    libraryMeta.normalizedCaseType,
    ...libraryMeta.problemTags,
    ...libraryMeta.abilityTags,
    ...libraryMeta.materialTags,
    libraryValueLabels[libraryMeta.trainingValue],
    libraryValueLabels[libraryMeta.contentValue],
    reviewStatusLabels[reviewStatusOf(record)],
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
  const [problemFilter, setProblemFilter] = useState("all");
  const [abilityFilter, setAbilityFilter] = useState("all");
  const [trainingValueFilter, setTrainingValueFilter] = useState<"all" | LibraryValueLevel>("all");
  const [savingReviewId, setSavingReviewId] = useState("");
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

  async function handleReviewStatusChange(record: SimulationRecord, reviewStatus: CaseReviewStatus) {
    const nextRecord = {
      ...record,
      reviewStatus,
    };

    setSavingReviewId(record.id);
    setError("");

    try {
      await saveRecord(nextRecord);
      setRecords((currentRecords) => currentRecords.map((item) => (item.id === record.id ? nextRecord : item)));
    } catch {
      setError("复核状态保存失败，无法写入本地案例库文件。");
    } finally {
      setSavingReviewId("");
    }
  }

  const enrichedRecords = useMemo<EnrichedRecord[]>(
    () =>
      records.map((record) => ({
        record,
        libraryMeta: normalizeCaseLibraryMeta(record),
        qualityReport: auditCaseQuality(record),
      })),
    [records],
  );

  const problemOptions = useMemo(
    () => uniqueTags(enrichedRecords.flatMap(({ libraryMeta }) => libraryMeta.problemTags)),
    [enrichedRecords],
  );

  const abilityOptions = useMemo(
    () => uniqueTags(enrichedRecords.flatMap(({ libraryMeta }) => libraryMeta.abilityTags)),
    [enrichedRecords],
  );

  const filteredRecords = useMemo(
    () =>
      enrichedRecords.filter(({ record, libraryMeta }) => {
        const stageMatched = stageFilter === "all" || record.input?.projectStage === stageFilter;
        const sourceMatched = sourceFilter === "all" || sourceOf(record) === sourceFilter;
        const problemMatched = problemFilter === "all" || libraryMeta.problemTags.includes(problemFilter);
        const abilityMatched = abilityFilter === "all" || libraryMeta.abilityTags.includes(abilityFilter);
        const trainingMatched = trainingValueFilter === "all" || libraryMeta.trainingValue === trainingValueFilter;

        return (
          stageMatched &&
          sourceMatched &&
          problemMatched &&
          abilityMatched &&
          trainingMatched &&
          recordMatchesSearch(record, libraryMeta, keyword.trim())
        );
      }),
    [abilityFilter, enrichedRecords, keyword, problemFilter, sourceFilter, stageFilter, trainingValueFilter],
  );

  const sourceSummary = useMemo(
    () => ({
      live: records.filter((record) => sourceOf(record) === "live_llm").length,
      local: records.filter((record) => sourceOf(record) === "local_rules").length,
    }),
    [records],
  );

  const librarySummary = useMemo(() => {
    const highTraining = enrichedRecords.filter(({ libraryMeta }) => libraryMeta.trainingValue === "high").length;
    const needsReview = enrichedRecords.filter(
      ({ record, qualityReport }) => reviewStatusOf(record) !== "approved" || qualityReport.overallStatus !== "pass",
    ).length;
    const workMaterialCoverage = enrichedRecords.filter(({ libraryMeta }) => libraryMeta.materialTags.length > 0).length;
    const approvedTraining = enrichedRecords.filter(
      ({ record, libraryMeta, qualityReport }) =>
        reviewStatusOf(record) === "approved" && libraryMeta.trainingValue === "high" && qualityReport.overallStatus === "pass",
    ).length;

    return {
      highTraining,
      needsReview,
      workMaterialCoverage,
      approvedTraining,
    };
  }, [enrichedRecords]);

  const hasActiveFilter =
    Boolean(keyword.trim()) ||
    stageFilter !== "all" ||
    sourceFilter !== "all" ||
    problemFilter !== "all" ||
    abilityFilter !== "all" ||
    trainingValueFilter !== "all";

  function clearFilters() {
    setKeyword("");
    setStageFilter("all");
    setSourceFilter("all");
    setProblemFilter("all");
    setAbilityFilter("all");
    setTrainingValueFilter("all");
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">全部案例</p>
              <p className="mt-1 text-2xl font-black text-pixel-yellow">{records.length}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">高训练价值</p>
              <p className="mt-1 text-2xl font-black text-pixel-green">{librarySummary.highTraining}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">可直接培训</p>
              <p className="mt-1 text-2xl font-black text-pixel-green">{librarySummary.approvedTraining}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">需复核 / 需修改</p>
              <p className="mt-1 text-2xl font-black text-pixel-yellow">{librarySummary.needsReview}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">材料覆盖</p>
              <p className="mt-1 text-2xl font-black text-pixel-cyan">{librarySummary.workMaterialCoverage}</p>
            </div>
            <div className="border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
              <p className="text-xs text-pixel-muted">接口 / 本地</p>
              <p className="mt-1 text-lg font-black text-pixel-cyan">
                {sourceSummary.live} / <span className="text-pixel-yellow">{sourceSummary.local}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_160px_160px_160px_160px_150px_auto]">
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
              <span className="field-label">问题类型</span>
              <select className="pixel-input" value={problemFilter} onChange={(event) => setProblemFilter(event.target.value)}>
                <option value="all">全部问题</option>
                {problemOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="field-label">能力短板</span>
              <select className="pixel-input" value={abilityFilter} onChange={(event) => setAbilityFilter(event.target.value)}>
                <option value="all">全部能力</option>
                {abilityOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="field-label">培训价值</span>
              <select
                className="pixel-input"
                value={trainingValueFilter}
                onChange={(event) => setTrainingValueFilter(event.target.value as "all" | LibraryValueLevel)}
              >
                {trainingValueOptions.map((option) => (
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
            {filteredRecords.map(({ record, libraryMeta, qualityReport }) => {
              const projectStage = record.input?.projectStage ?? "other";
              const reviewStatus = reviewStatusOf(record);

              return (
                <article
                  key={record.id}
                  className="grid gap-4 border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h2 className="text-lg font-bold text-pixel-yellow">{record.levelName}</h2>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="border-2 border-pixel-border px-2 py-1 text-pixel-muted">
                        {stageLabels[projectStage] ?? "其他"}
                      </span>
                      <span className="border-2 border-pixel-cyan px-2 py-1 text-pixel-cyan">{sourceLabels[sourceOf(record)]}</span>
                      <span className="border-2 border-pixel-border px-2 py-1 text-pixel-muted">
                        {libraryMeta.normalizedCaseType}
                      </span>
                      <span className={`border-2 px-2 py-1 ${qualityStatusClass[qualityReport.overallStatus]}`}>
                        核查：{caseQualityStatusLabels[qualityReport.overallStatus]}
                      </span>
                      <span className="border-2 border-pixel-yellow px-2 py-1 text-pixel-yellow">
                        培训价值：{libraryValueLabels[libraryMeta.trainingValue]}
                      </span>
                      <span className={`border-2 px-2 py-1 ${reviewStatusClass[reviewStatus]}`}>
                        复核：{reviewStatusLabels[reviewStatus]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-pixel-muted">{record.input?.projectName || "未填写项目名称"}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-pixel-text">{record.input?.currentProblem || "未填写当前问题"}</p>
                    <div className="mt-3 grid gap-2">
                      <LibraryTags label="问题" tags={libraryMeta.problemTags} />
                      <LibraryTags label="能力" tags={libraryMeta.abilityTags} />
                      <LibraryTags label="材料" tags={libraryMeta.materialTags} />
                    </div>
                    <p className="mt-2 text-xs text-pixel-muted">{new Date(record.createdAt).toLocaleString("zh-CN")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <label className="grid gap-1 text-xs text-pixel-muted">
                      <span>复核状态</span>
                      <select
                        className="pixel-input min-w-40"
                        value={reviewStatus}
                        onChange={(event) => handleReviewStatusChange(record, event.target.value as CaseReviewStatus)}
                        disabled={savingReviewId === record.id}
                      >
                        {reviewStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Link className="pixel-link-button" href={`/history/${record.id}`}>
                      <Eye size={16} />
                      打开
                    </Link>
                    <PixelButton type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)}>
                      删除
                    </PixelButton>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PixelCard>
    </PixelLayout>
  );
}
