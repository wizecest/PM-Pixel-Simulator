import { auditCaseQuality } from "@/services/caseQualityService";
import type {
  AbilityScore,
  CaseLibraryMeta,
  CaseAsset,
  GapScanItem,
  LibraryValueLevel,
  ProjectStage,
  RoleSimulationResult,
  ShareableCaseOutput,
  SimulationRecord,
} from "@/types/simulation";

export const libraryValueLabels: Record<LibraryValueLevel, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const stageCaseTypeLabels: Record<ProjectStage, string> = {
  planning: "前期策划推进问题",
  feasibility: "可研论证问题",
  scheme_design: "方案设计管理问题",
  preliminary_design: "初设管理问题",
  construction_drawing: "施工图管理问题",
  procurement: "招采管理问题",
  construction: "施工推进问题",
  acceptance: "验收移交问题",
  settlement: "结算收口问题",
  other: "待归类",
};

const problemRules = [
  { tag: "责任不清", terms: ["责任", "责任人", "责任单位", "分工", "边界"] },
  { tag: "节点失控", terms: ["节点", "延期", "逾期", "截止", "进度", "时间"] },
  { tag: "成果不明", terms: ["成果", "输出", "提交", "文件", "版本", "清单"] },
  { tag: "风险未识别", terms: ["风险", "隐患", "预警", "偏差"] },
  { tag: "留痕不足", terms: ["留痕", "归档", "证据", "记录", "纪要", "台账"] },
  { tag: "闭环不足", terms: ["闭环", "销项", "复核", "检查", "收口"] },
];

const abilityRules = [
  { tag: "全局视野", scoreKey: "globalView", terms: ["全局", "统筹", "整体"] },
  { tag: "节点控制", scoreKey: "scheduleControl", terms: ["节点", "进度", "时间", "截止"] },
  { tag: "责任判断", scoreKey: "responsibilityJudgment", terms: ["责任", "分工", "责任人"] },
  { tag: "协同推进", scoreKey: "coordination", terms: ["协同", "协调", "沟通", "参会"] },
  { tag: "闭环能力", scoreKey: "closure", terms: ["闭环", "销项", "复核", "收口"] },
  { tag: "风险识别", scoreKey: "riskIdentification", terms: ["风险", "隐患", "预警"] },
  { tag: "证据意识", scoreKey: "evidenceAwareness", terms: ["证据", "留痕", "记录", "归档"] },
  { tag: "复盘沉淀", scoreKey: "reviewAndAssetization", terms: ["复盘", "沉淀", "模板", "案例"] },
] as const;

const materialRules = [
  { tag: "会议纪要", terms: ["会议纪要", "专题会", "协调会"] },
  { tag: "责任节点表", terms: ["责任节点表", "责任表", "节点表"] },
  { tag: "催办记录", terms: ["催办", "任务单", "跟踪记录"] },
  { tag: "报审清单", terms: ["报审", "附件核对", "核对表"] },
  { tag: "归档清单", terms: ["归档", "资料清单", "档案"] },
];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function isProjectStage(value: string): value is ProjectStage {
  return value in stageCaseTypeLabels;
}

function isLibraryValue(value: unknown): value is LibraryValueLevel {
  return value === "high" || value === "medium" || value === "low";
}

function matchesAny(text: string, terms: readonly string[]) {
  return terms.some((term) => text.includes(term));
}

function inferTags(text: string, rules: { tag: string; terms: string[] }[]) {
  return rules.filter((rule) => matchesAny(text, rule.terms)).map((rule) => rule.tag);
}

function normalizeCaseType(record: SimulationRecord) {
  const storedType = asText(record.caseAsset?.libraryMeta?.normalizedCaseType);
  const rawType = asText(record.caseAsset?.caseType);

  if (storedType && !isProjectStage(storedType)) {
    return storedType;
  }
  if (rawType && isProjectStage(rawType)) {
    return stageCaseTypeLabels[rawType];
  }
  if (rawType) {
    return rawType;
  }

  const stage = record.input?.projectStage;
  return stage && isProjectStage(stage) ? stageCaseTypeLabels[stage] : "待归类";
}

function collectRecordText(record: SimulationRecord) {
  const asset = record.caseAsset;
  const roles = asArray<Partial<RoleSimulationResult>>(record.roleResults);
  const gapItems = asArray<Partial<GapScanItem>>(record.gapScan?.items);
  const outputs = asArray<Partial<ShareableCaseOutput>>(asset?.shareableOutputs);

  return [
    record.input?.projectStage,
    record.input?.currentProblem,
    record.input?.proposedAction,
    record.input?.involvedParties,
    record.mainQuest,
    ...asArray<string>(record.hiddenRisks),
    ...roles.flatMap((role) => [
      role.npcLine,
      ...asArray<string>(role.concerns),
      ...asArray<string>(role.challenges),
      ...asArray<string>(role.missingItems),
      ...asArray<string>(role.recommendedActions),
      ...asArray<string>(role.consequences),
    ]),
    ...gapItems.flatMap((item) => [item.label, item.problem, item.improvementAction]),
    asset?.caseType,
    ...asArray<string>(asset?.exposedProblems),
    ...asArray<string>(asset?.reusableTemplates),
    ...asArray<string>(asset?.aiWorkflows),
    ...outputs.flatMap((output) => [output.title, output.usage, output.content]),
    record.abilityScore?.trainingFocus,
    ...asArray<string>(record.abilityScore?.deductions),
  ]
    .map(asText)
    .filter(Boolean)
    .join("\n");
}

function inferProblemTags(record: SimulationRecord, text: string) {
  const stored = asArray<string>(record.caseAsset?.libraryMeta?.problemTags);
  const inferred = inferTags(text, problemRules);
  const tags = unique([...stored, ...inferred]);

  return tags.length > 0 ? tags : ["待归类"];
}

function inferAbilityTags(record: SimulationRecord, text: string) {
  const stored = asArray<string>(record.caseAsset?.libraryMeta?.abilityTags);
  const score = record.abilityScore as Partial<AbilityScore> | undefined;
  const scoreTags = abilityRules
    .filter((rule) => {
      const value = score?.[rule.scoreKey];
      return typeof value === "number" && Number.isFinite(value) && value < 70;
    })
    .map((rule) => rule.tag);
  const textTags = abilityRules.filter((rule) => matchesAny(text, rule.terms)).map((rule) => rule.tag);

  return unique([...stored, ...scoreTags, ...textTags]);
}

function inferMaterialTags(record: SimulationRecord, text: string) {
  const stored = asArray<string>(record.caseAsset?.libraryMeta?.materialTags);
  const inferred = inferTags(text, materialRules);

  return unique([...stored, ...inferred]);
}

function inferTrainingValue(record: SimulationRecord, problemTags: string[]) {
  const stored = record.caseAsset?.libraryMeta?.trainingValue;
  if (isLibraryValue(stored)) {
    return stored;
  }

  const qualityScore = auditCaseQuality(record).score;
  if (record.caseAsset?.suitableForTraining && qualityScore >= 85 && problemTags.length >= 2) {
    return "high";
  }
  if (record.caseAsset?.suitableForTraining || qualityScore >= 70) {
    return "medium";
  }

  return "low";
}

function inferContentValue(record: SimulationRecord, materialTags: string[]) {
  const stored = record.caseAsset?.libraryMeta?.contentValue;
  if (isLibraryValue(stored)) {
    return stored;
  }

  const outputs = asArray<ShareableCaseOutput>(record.caseAsset?.shareableOutputs);
  if (record.caseAsset?.suitableForContent && materialTags.length >= 3) {
    return "high";
  }
  if (record.caseAsset?.suitableForContent || materialTags.length > 0 || outputs.length > 0) {
    return "medium";
  }

  return "low";
}

export function normalizeCaseLibraryMeta(record: SimulationRecord): CaseLibraryMeta {
  const text = collectRecordText(record);
  const problemTags = inferProblemTags(record, text);
  const abilityTags = inferAbilityTags(record, text);
  const materialTags = inferMaterialTags(record, text);

  return {
    normalizedCaseType: normalizeCaseType(record),
    problemTags,
    abilityTags,
    materialTags,
    trainingValue: inferTrainingValue(record, problemTags),
    contentValue: inferContentValue(record, materialTags),
  };
}
