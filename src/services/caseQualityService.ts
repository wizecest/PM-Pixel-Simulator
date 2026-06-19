import type {
  ActionItem,
  CaseQualityCheck,
  CaseQualityReport,
  CaseQualityStatus,
  GapScanItem,
  RoleSimulationResult,
  ShareableCaseOutput,
  SimulationRecord,
} from "@/types/simulation";

export const caseQualityStatusLabels: Record<CaseQualityStatus, string> = {
  pass: "合格",
  warning: "需复核",
  fail: "不完整",
};

const vaguePhrases = [
  "加强沟通",
  "持续跟进",
  "及时沟通",
  "积极协调",
  "推进落实",
  "持续关注",
  "尽快处理",
  "相关人员",
  "有关部门",
  "后续跟进",
  "加强管理",
  "提高意识",
  "完善机制",
];

const gapDimensions = [
  { label: "目标", terms: ["目标", "要求", "范围", "口径"] },
  { label: "责任", terms: ["责任", "责任人", "责任单位"] },
  { label: "节点", terms: ["节点", "时间", "期限", "截止", "完成"] },
  { label: "成果", terms: ["成果", "输出", "提交", "文件", "清单"] },
  { label: "风险", terms: ["风险", "隐患", "偏差"] },
  { label: "闭环", terms: ["闭环", "销项", "复核", "检查"] },
  { label: "留痕", terms: ["留痕", "归档", "证据", "记录", "纪要"] },
];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasText(value: unknown) {
  return asText(value).length > 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusForScore(score: number): CaseQualityStatus {
  if (score >= 75) {
    return "pass";
  }
  if (score >= 50) {
    return "warning";
  }
  return "fail";
}

function buildCheck(
  key: string,
  label: string,
  score: number,
  summary: string,
  details: string[] = [],
): CaseQualityCheck {
  const normalizedScore = clampScore(score);

  return {
    key,
    label,
    status: statusForScore(normalizedScore),
    score: normalizedScore,
    summary,
    details: details.filter(Boolean),
  };
}

function average(scores: number[]) {
  if (scores.length === 0) {
    return 0;
  }

  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function uniqueTexts(values: string[]) {
  return new Set(values.map((value) => value.trim()).filter(Boolean));
}

function actionBuckets(record: SimulationRecord) {
  const plan = record.actionPlan;

  return [
    asArray<ActionItem>(plan?.todayActions),
    asArray<ActionItem>(plan?.tomorrowActions),
    asArray<ActionItem>(plan?.weeklyActions),
  ];
}

function allActions(record: SimulationRecord) {
  return actionBuckets(record).flat();
}

function isCompleteAction(item: Partial<ActionItem>) {
  return hasText(item.owner) && hasText(item.action) && hasText(item.deadline) && hasText(item.output) && hasText(item.checker);
}

function actionText(item: Partial<ActionItem>) {
  return [item.owner, item.action, item.deadline, item.output, item.checker].map(asText).join("\n");
}

function checkRolePerspective(record: SimulationRecord) {
  const roles = asArray<Partial<RoleSimulationResult>>(record.roleResults);
  const details: string[] = [];

  if (roles.length === 0) {
    return buildCheck("role_perspective", "角色视角区分", 0, "缺少角色推演结果。", ["未找到角色推演结果。"]);
  }

  const namedRoles = roles.filter((role) => hasText(role.roleName));
  const uniqueNames = uniqueTexts(namedRoles.map((role) => asText(role.roleName))).size;
  const completeRoles = roles.filter((role) => {
    const sections = [
      asArray<string>(role.concerns),
      asArray<string>(role.challenges),
      asArray<string>(role.missingItems),
      asArray<string>(role.recommendedActions),
    ];

    return hasText(role.npcLine) && sections.every((items) => items.length > 0);
  });
  const signatures = roles.map((role) =>
    [
      asArray<string>(role.concerns),
      asArray<string>(role.challenges),
      asArray<string>(role.missingItems),
      asArray<string>(role.recommendedActions),
    ]
      .flat()
      .map(asText)
      .join("|")
      .toLowerCase(),
  );
  const uniqueSignatures = uniqueTexts(signatures).size;

  let score = 0;
  score += roles.length >= 2 ? 25 : 10;
  score += uniqueNames === roles.length ? 20 : Math.round((uniqueNames / roles.length) * 20);
  score += Math.round((completeRoles.length / roles.length) * 30);
  score += uniqueSignatures >= Math.min(roles.length, 2) ? 25 : 8;

  if (roles.length < 2) {
    details.push("角色数量不足，难以形成多视角质疑。");
  }
  if (uniqueNames !== roles.length) {
    details.push("存在角色名称缺失或重复，需要人工复核。");
  }
  if (completeRoles.length !== roles.length) {
    details.push("部分角色缺少台词、关注点、质疑点、缺项或建议动作。");
  }
  if (uniqueSignatures < Math.min(roles.length, 2)) {
    details.push("角色输出相似度偏高，视角区分不明显。");
  }

  return buildCheck("role_perspective", "角色视角区分", score, `已核查 ${roles.length} 个角色视角。`, details);
}

function checkActionPlan(record: SimulationRecord) {
  const buckets = actionBuckets(record);
  const actions = buckets.flat();
  const details: string[] = [];

  if (actions.length === 0) {
    return buildCheck("action_plan", "行动方案完整度", 0, "缺少可执行行动项。", ["行动方案未提供今天、明天或本周行动项。"]);
  }

  const requiredFields = ["owner", "action", "deadline", "output", "checker"] as const;
  const filledFields = actions.reduce(
    (total, item) => total + requiredFields.filter((field) => hasText(item[field])).length,
    0,
  );
  const completeActions = actions.filter(isCompleteAction).length;
  const activeBuckets = buckets.filter((items) => items.length > 0).length;
  const fieldScore = (filledFields / (actions.length * requiredFields.length)) * 75;
  const bucketScore = activeBuckets >= 2 ? 15 : 5;
  const completeScore = completeActions === actions.length ? 10 : Math.round((completeActions / actions.length) * 10);
  const score = fieldScore + bucketScore + completeScore;

  if (completeActions !== actions.length) {
    details.push("部分行动项缺少责任人、动作、时间、成果或检查人。");
  }
  if (buckets[0].length === 0) {
    details.push("缺少今天立即执行的行动项。");
  }
  if (activeBuckets < 2) {
    details.push("行动方案时间层次不足，建议至少覆盖今天和后续节点。");
  }

  return buildCheck("action_plan", "行动方案完整度", score, `已核查 ${actions.length} 个行动项。`, details);
}

function checkGapScan(record: SimulationRecord) {
  const items = asArray<GapScanItem>(record.gapScan?.items);
  const details: string[] = [];

  if (items.length === 0) {
    return buildCheck("gap_scan", "漏洞扫描覆盖度", 0, "缺少管理漏洞扫描结果。", ["未找到漏洞扫描检查项。"]);
  }

  const text = items
    .map((item) => [item.label, item.problem, item.improvementAction].map(asText).join("\n"))
    .join("\n");
  const coveredDimensions = gapDimensions.filter((dimension) => dimension.terms.some((term) => text.includes(term)));
  const score = 25 + (coveredDimensions.length / gapDimensions.length) * 65 + Math.min(items.length, 5) * 2;

  if (coveredDimensions.length < gapDimensions.length) {
    const missingLabels = gapDimensions
      .filter((dimension) => !coveredDimensions.includes(dimension))
      .map((dimension) => dimension.label)
      .join("、");
    details.push(`漏洞扫描未明显覆盖：${missingLabels}。`);
  }
  if (items.length < 4) {
    details.push("漏洞扫描检查项偏少，建议覆盖更多管理维度。");
  }

  return buildCheck("gap_scan", "漏洞扫描覆盖度", score, `已核查 ${items.length} 个漏洞扫描项。`, details);
}

function checkAbilityScore(record: SimulationRecord) {
  const score = record.abilityScore;
  const details: string[] = [];

  if (!score) {
    return buildCheck("ability_score", "能力评分解释", 0, "缺少能力评分。", ["未找到能力评分结果。"]);
  }

  const dimensions = [
    score.globalView,
    score.scheduleControl,
    score.responsibilityJudgment,
    score.coordination,
    score.closure,
    score.riskIdentification,
    score.evidenceAwareness,
    score.reviewAndAssetization,
  ];
  const numericDimensions = dimensions.filter((value) => typeof value === "number" && Number.isFinite(value)).length;
  const deductions = asArray<string>(score.deductions);
  const hasTotal = typeof score.total === "number" && Number.isFinite(score.total);
  const hasTrainingFocus = hasText(score.trainingFocus);
  const resultScore =
    (hasTotal ? 25 : 0) +
    (numericDimensions / dimensions.length) * 25 +
    (deductions.length > 0 ? 30 : 0) +
    (hasTrainingFocus ? 20 : 0);

  if (!hasTotal) {
    details.push("综合评分缺失或不是数字。");
  }
  if (numericDimensions !== dimensions.length) {
    details.push("部分能力维度分数缺失或不是数字。");
  }
  if (deductions.length === 0) {
    details.push("缺少扣分原因。");
  }
  if (!hasTrainingFocus) {
    details.push("缺少训练重点。");
  }

  return buildCheck("ability_score", "能力评分解释", resultScore, "已核查能力评分、扣分原因和训练重点。", details);
}

function checkCaseAsset(record: SimulationRecord) {
  const asset = record.caseAsset;
  const details: string[] = [];

  if (!asset) {
    return buildCheck("case_asset", "案例沉淀完整度", 0, "缺少案例沉淀。", ["未找到案例沉淀结果。"]);
  }

  const exposedProblems = asArray<string>(asset.exposedProblems);
  const reusableTemplates = asArray<string>(asset.reusableTemplates);
  const shareableOutputs = asArray<ShareableCaseOutput>(asset.shareableOutputs).filter(
    (output) => hasText(output.title) && hasText(output.usage) && hasText(output.content),
  );
  const hasTrainingFlag = typeof asset.suitableForTraining === "boolean";
  const hasContentFlag = typeof asset.suitableForContent === "boolean";
  const resultScore =
    (hasText(asset.caseType) ? 18 : 0) +
    (exposedProblems.length > 0 ? 22 : 0) +
    (reusableTemplates.length > 0 ? 22 : 0) +
    (shareableOutputs.length > 0 ? 24 : 0) +
    (hasTrainingFlag && hasContentFlag ? 14 : 0);

  if (!hasText(asset.caseType)) {
    details.push("缺少案例类型。");
  }
  if (exposedProblems.length === 0) {
    details.push("缺少暴露问题。");
  }
  if (reusableTemplates.length === 0) {
    details.push("缺少可复用模板。");
  }
  if (shareableOutputs.length === 0) {
    details.push("缺少可复制或可分享成果。");
  }
  if (!hasTrainingFlag || !hasContentFlag) {
    details.push("缺少培训价值或内容化判断。");
  }

  return buildCheck("case_asset", "案例沉淀完整度", resultScore, "已核查案例类型、暴露问题、模板和成果。", details);
}

function checkConcreteLanguage(record: SimulationRecord) {
  const roleTexts = asArray<Partial<RoleSimulationResult>>(record.roleResults).flatMap((role) => [
    role.npcLine,
    ...asArray<string>(role.concerns),
    ...asArray<string>(role.challenges),
    ...asArray<string>(role.missingItems),
    ...asArray<string>(role.recommendedActions),
    ...asArray<string>(role.consequences),
  ]);
  const gapTexts = asArray<GapScanItem>(record.gapScan?.items).flatMap((item) => [item.label, item.problem, item.improvementAction]);
  const actionTexts = allActions(record).map(actionText);
  const assetTexts = [
    record.caseAsset?.caseType,
    ...asArray<string>(record.caseAsset?.exposedProblems),
    ...asArray<string>(record.caseAsset?.reusableTemplates),
    ...asArray<ShareableCaseOutput>(record.caseAsset?.shareableOutputs).flatMap((output) => [
      output.title,
      output.usage,
      output.content,
    ]),
  ];
  const combinedText = [...roleTexts, ...gapTexts, ...actionTexts, ...assetTexts].map(asText).join("\n");
  const vagueCount = vaguePhrases.filter((phrase) => combinedText.includes(phrase)).length;
  const completeActionCount = allActions(record).filter(isCompleteAction).length;
  const outputCount = asArray<ShareableCaseOutput>(record.caseAsset?.shareableOutputs).filter((output) => hasText(output.content)).length;
  const concreteAnchorCount = completeActionCount + outputCount;
  const details: string[] = [];

  let score = 100;
  if (vagueCount > 0 && concreteAnchorCount >= 5) {
    score = 82;
  } else if (vagueCount > 0 && concreteAnchorCount >= 2) {
    score = 62;
  } else if (vagueCount > 0) {
    score = 38;
  }

  if (vagueCount > 0) {
    details.push(`发现 ${vagueCount} 类可能空泛表达，需要核对是否已有具体输出。`);
  }
  if (concreteAnchorCount < 2) {
    details.push("可核查的具体行动或成果偏少。");
  }

  return buildCheck("concrete_language", "空泛表达控制", score, "已核查常见空泛表达和具体成果锚点。", details);
}

export function auditCaseQuality(record: SimulationRecord): CaseQualityReport {
  const checks = [
    checkRolePerspective(record),
    checkActionPlan(record),
    checkGapScan(record),
    checkAbilityScore(record),
    checkCaseAsset(record),
    checkConcreteLanguage(record),
  ];
  const score = clampScore(average(checks.map((check) => check.score)));
  const failCount = checks.filter((check) => check.status === "fail").length;
  const warningCount = checks.filter((check) => check.status === "warning").length;
  const overallStatus: CaseQualityStatus =
    failCount >= 2 || score < 50 ? "fail" : failCount > 0 || warningCount > 0 || score < 80 ? "warning" : "pass";
  const warnings = Array.from(
    new Set(
      checks.flatMap((check) => {
        if (check.status === "pass") {
          return [];
        }

        return check.details.length > 0 ? check.details : [check.summary];
      }),
    ),
  );

  return {
    overallStatus,
    score,
    checks,
    warnings,
  };
}
