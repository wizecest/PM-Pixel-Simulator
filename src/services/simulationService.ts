import checkItems from "@/data/checkItems.json";
import { buildCaseTemplatePackageOutput } from "@/services/caseAssetService";
import { buildSimulationPrompt } from "@/services/promptTemplate";
import type {
  AbilityScore,
  ActionPlan,
  GapScanItem,
  GapStatus,
  GenerateSimulationParams,
  GenerateSimulationResponse,
  ProjectStage,
  Role,
  RoleSimulationResult,
} from "@/types/simulation";

type CheckItem = {
  key: string;
  label: string;
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

export { buildSimulationPrompt };

const statusLabels: Record<GapStatus, string> = {
  pass: "通过",
  partial: "部分通过",
  fail: "不通过",
};

function has(text: string, pattern: RegExp) {
  return pattern.test(text);
}

function clampScore(value: number) {
  return Math.max(45, Math.min(96, value));
}

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getStatus(action: string, passPattern: RegExp, partialPattern?: RegExp): GapStatus {
  if (has(action, passPattern)) {
    return "pass";
  }

  if (partialPattern && has(action, partialPattern)) {
    return "partial";
  }

  return "fail";
}

function statusPenalty(status: GapStatus) {
  if (status === "fail") {
    return 22;
  }

  if (status === "partial") {
    return 10;
  }

  return 0;
}

function buildGapItem(inputAction: string, item: CheckItem): GapScanItem {
  const action = inputAction.trim();

  const rules: Record<
    string,
    {
      pass: RegExp;
      partial?: RegExp;
      failProblem: string;
      partialProblem: string;
      improvementAction: string;
    }
  > = {
    goal: {
      pass: /(形成|完成|提交|输出|报审|销项).*(清单|成果|稿|报告|表|纪要|附件)/,
      partial: /(完成|提交|输出|报审|解决|推进)/,
      failProblem: "方案没有说明要达成的具体管理成果。",
      partialProblem: "方案提到推进目标，但成果标准不够清楚。",
      improvementAction: "明确本次要形成的成果，例如修改清单、正式成果稿、复核意见和报审附件包。",
    },
    responsibility: {
      pass: /(由|责任人|主责|牵头|配合|检查人|复核人)/,
      partial: /(我|我们|设计单位|前期|项目负责人|部门|单位)/,
      failProblem: "没有区分主责人、配合人和检查人。",
      partialProblem: "提到相关人员或单位，但没有压实责任分工。",
      improvementAction: "写清项目负责人牵头、专业人员办理、服务单位提交、检查人复核。",
    },
    deadline: {
      pass: /(今日|今天|明日|明天|本周|周[一二三四五六日天]|上午|下午|\d{1,2}[:：]\d{2}|\d+个工作日|\d{1,2}月|\d{1,2}日)/,
      partial: /(尽快|及时|马上|近期|抓紧)/,
      failProblem: "没有具体完成时间。",
      partialProblem: "只写了“尽快、及时”等弹性表述，无法检查节点。",
      improvementAction: "明确提交时间、内部复核时间和对外报审时间。",
    },
    deliverable: {
      pass: /(清单|纪要|台账|闭环表|销项表|报告|成果|附件|版本|修改稿|估算表|图纸)/,
      partial: /(材料|资料|文件|文本)/,
      failProblem: "没有定义提交什么文件或成果。",
      partialProblem: "提到资料或文件，但没有明确成果名称和标准。",
      improvementAction: "明确输出成果名称、版本要求、附件清单和复核口径。",
    },
    coordination: {
      pass: /(组织|召开|会议|专题会|协调).*(单位|部门|人员|前期|设计|施工|咨询|财局)/,
      partial: /(沟通|协调|联系|通知)/,
      failProblem: "没有说明哪些部门或单位必须参与。",
      partialProblem: "有沟通动作，但没有形成协同机制。",
      improvementAction: "组织专题会，列明参会单位、议题、决议和会后责任表。",
    },
    risk: {
      pass: /(风险|影响|延误|退件|审计|问责|总节点|预警|升级)/,
      partial: /(问题|困难|滞后|拖延|迟迟)/,
      failProblem: "没有识别后续节点、审批或审计风险。",
      partialProblem: "识别了问题现象，但没有判断影响范围和风险等级。",
      improvementAction: "说明该问题影响哪个后续节点，是否需要预警或升级协调。",
    },
    archive: {
      pass: /(归档|留痕|记录|纪要|版本|证据|催办|书面)/,
      partial: /(微信|电话|邮件|通知)/,
      failProblem: "没有考虑会议纪要、催办记录和版本留存。",
      partialProblem: "有联系动作，但证据链不完整。",
      improvementAction: "同步归档意见来源、会议纪要、催办记录、成果版本和销项表。",
    },
    closure: {
      pass: /(闭环|销项|复核|反馈|检查|确认|跟踪)/,
      partial: /(提交|完成|处理|推进)/,
      failProblem: "没有设置反馈、复核和销项机制。",
      partialProblem: "有完成动作，但缺少复核和销项口径。",
      improvementAction: "设置提交后复核、问题销项和结果反馈节点。",
    },
    report: {
      pass: /(上报|汇报|分管领导|总经理|公司协调|升级)/,
      partial: /(领导|会议|协调)/,
      failProblem: "没有判断是否需要向分管领导或公司层面上报。",
      partialProblem: "提到领导或会议，但没有明确上报条件。",
      improvementAction: "明确若节点继续偏差或需外部协调时，由项目负责人向分管领导上报。",
    },
    accountability: {
      pass: /(书面|责任|依据|纪要|催办|考核|问责|确认|签收)/,
      partial: /(通知|沟通|联系)/,
      failProblem: "没有形成可追责的书面依据。",
      partialProblem: "有通知或联系，但责任口径不够可追溯。",
      improvementAction: "将任务、责任、时限和成果标准写入纪要、催办单或销项表。",
    },
  };

  const rule = rules[item.key];
  let status = getStatus(action, rule.pass, rule.partial);
  if (item.key === "deadline" && /(通知|沟通|联系).*(尽快|及时|抓紧|近期)|尽快提交/.test(action)) {
    status = "partial";
  }

  return {
    key: item.key,
    label: item.label,
    status,
    problem: status === "pass" ? "该项已有基本安排。" : status === "partial" ? rule.partialProblem : rule.failProblem,
    improvementAction: status === "pass" ? "执行中继续保留书面记录和复核结果。" : rule.improvementAction,
  };
}

function buildGapScan(action: string) {
  return {
    items: (checkItems as CheckItem[]).map((item) => buildGapItem(action, item)),
  };
}

function scoreFrom(items: GapScanItem[], keys: string[]) {
  const selected = items.filter((item) => keys.includes(item.key));
  return clampScore(92 - selected.reduce((sum, item) => sum + statusPenalty(item.status), 0));
}

function buildAbilityScore(items: GapScanItem[]): AbilityScore {
  const globalView = scoreFrom(items, ["goal", "risk", "report"]);
  const scheduleControl = scoreFrom(items, ["deadline", "closure"]);
  const responsibilityJudgment = scoreFrom(items, ["responsibility", "accountability"]);
  const coordination = scoreFrom(items, ["coordination", "responsibility"]);
  const closure = scoreFrom(items, ["closure", "deliverable"]);
  const riskIdentification = scoreFrom(items, ["risk", "report"]);
  const evidenceAwareness = scoreFrom(items, ["archive", "accountability"]);
  const reviewAndAssetization = scoreFrom(items, ["archive", "closure", "deliverable"]);
  const total = average([
    globalView,
    scheduleControl,
    responsibilityJudgment,
    coordination,
    closure,
    riskIdentification,
    evidenceAwareness,
    reviewAndAssetization,
  ]);

  const deductions = items
    .filter((item) => item.status !== "pass")
    .slice(0, 5)
    .map((item) => `${item.label}：${item.problem}`);

  return {
    globalView,
    scheduleControl,
    responsibilityJudgment,
    coordination,
    closure,
    riskIdentification,
    evidenceAwareness,
    reviewAndAssetization,
    total,
    deductions: deductions.length > 0 ? deductions : ["推进方案结构较完整，后续重点是执行过程留痕和复核质量。"],
    trainingFocus:
      total >= 85
        ? "本次重点是把已有管理动作沉淀为模板，减少同类问题重复发生。"
        : "本次短板不是不知道要推进，而是推进动作需要节点化、成果化、责任化和闭环化。",
  };
}

function splitParties(value?: string) {
  const parties = value
    ?.split(/[、,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parties && parties.length > 0
    ? parties
    : ["项目负责人", "设计管理人员", "前期报批人员", "服务单位", "资料档案人员"];
}

function buildLevelName(problem: string, stage: ProjectStage) {
  if (has(problem, /(财局|财政).*(可研|修改)|可研.*(迟迟|滞后|修改)/)) {
    return "可研修改滞后危机";
  }

  if (has(problem, /(报批|审批|退件)/)) {
    return "报批路径卡点处置";
  }

  if (has(problem, /(图纸|设计|变更|修改)/)) {
    return "设计成果闭环挑战";
  }

  if (has(problem, /(施工|现场|质量|安全|进度)/)) {
    return "现场节点偏差关卡";
  }

  return `${stageLabels[stage]}推进漏洞扫描`;
}

function buildRiskLevel(problem: string, failedCount: number): GenerateSimulationResponse["riskLevel"] {
  if (failedCount >= 6 || has(problem, /(停工|重大|安全|审计|问责|严重|超概|无法报审)/)) {
    return "high";
  }

  if (failedCount >= 3 || has(problem, /(迟迟|滞后|延误|退件|缺少|未提交|未完成)/)) {
    return "medium_high";
  }

  if (failedCount >= 1) {
    return "medium";
  }

  return "low";
}

function buildHiddenRisks(items: GapScanItem[]) {
  const risks = items
    .filter((item) => item.status !== "pass")
    .slice(0, 4)
    .map((item) => item.improvementAction);

  return risks.length > 0 ? risks : ["执行过程未及时复核时，仍可能出现成果质量和资料留痕偏差。"];
}

function roleResult(role: Role, input: GenerateSimulationParams["input"]): RoleSimulationResult {
  const project = input.projectName;
  const action = input.proposedAction;
  const stage = stageLabels[input.projectStage];

  const fallback: RoleSimulationResult = {
    roleId: role.id,
    roleName: role.name,
    npcLine: `“我不只看你说要处理，我要看 ${project} 的责任、节点、成果和闭环。”`,
    concerns: [`${stage}阶段的管理目标是否被转成可检查任务。`],
    challenges: role.defaultQuestions.slice(0, 4),
    missingItems: [`当前方案“${action}”还需要补足责任、时间和成果口径。`],
    recommendedActions: ["把任务拆成责任人、完成时间、输出成果、检查人四列。"],
    consequences: ["如果继续用口头推进，后续偏差难以复盘和追责。"],
  };

  const templates: Record<string, RoleSimulationResult> = {
    general_manager: {
      roleId: role.id,
      roleName: role.name,
      npcLine: "“你说对方慢，我不接受这个表述。我要看节点偏差、责任动作和闭环结果。”",
      concerns: [`${project} 是否影响公司总节点，项目负责人是否已经形成有效管理动作。`],
      challenges: [
        "原计划节点是什么，当前实际完成到哪里？",
        "谁是第一责任人，谁负责复核结果？",
        "为什么没有提前预警，是否需要公司层面协调？",
        "是否形成书面催办和会议决议？",
      ],
      missingItems: [`方案“${action}”没有把偏差原因、责任边界、升级条件和结果检查说清楚。`],
      recommendedActions: ["由项目负责人今日组织专题会，形成问题清单、责任表、节点表和销项规则。"],
      consequences: ["问题继续漂在服务单位侧，公司无法判断责任和节点影响，后续容易被动问责。"],
    },
    project_leader: {
      roleId: role.id,
      roleName: role.name,
      npcLine: "“通知不是推进。我要把问题放进总控节点表，逐项跟踪到销项。”",
      concerns: [`${stage}阶段的后续节点是否会被当前问题拖延。`],
      challenges: [
        "当前偏差影响哪个后续节点？",
        "设计、前期、资料各自要交什么？",
        "谁跟踪反馈，谁判断是否升级？",
        "是否有每日或隔日的复核节奏？",
      ],
      missingItems: ["缺少节点总控、协同安排、升级条件和销项机制。"],
      recommendedActions: ["建立《问题推进闭环表》，把责任人、配合人、完成时间、成果标准、检查人写入同一张表。"],
      consequences: ["协同动作会停留在口头层面，项目负责人无法证明自己已经有效履职。"],
    },
    design_manager: {
      roleId: role.id,
      roleName: role.name,
      npcLine: "“我不能只等一个修改稿。我要先看到逐条修改清单和版本控制。”",
      concerns: ["设计任务边界、修改意见拆解、成果质量和版本一致性。"],
      challenges: [
        "修改意见是否逐条拆成清单？",
        "文本、图纸、估算和附件是否同步修改？",
        "谁复核成果质量，复核标准是什么？",
        "新旧版本如何留存和标识？",
      ],
      missingItems: ["缺少修改清单、成果标准、复核安排和版本管理。"],
      recommendedActions: ["今日整理《设计修改清单》，要求服务单位按条回复处理方式并提交正式版本。"],
      consequences: "成果可能反复返工，报审材料口径不一致，后续无法说明修改依据。".split("，"),
    },
    approval_manager: {
      roleId: role.id,
      roleName: role.name,
      npcLine: "“能不能报，不看你催了没有，要看附件齐不齐、口径准不准。”",
      concerns: ["报批路径、报审附件、审批口径和退件风险。"],
      challenges: [
        "本次成果要走哪个报审路径？",
        "财局或主管部门意见是否已转成附件清单？",
        "缺哪个材料会导致退件？",
        "是否需要提前确认外部口径？",
      ],
      missingItems: ["没有同步校核报审附件和外部审批口径。"],
      recommendedActions: ["前期报批人员同步列出报审附件清单，并在成果提交前完成口径复核。"],
      consequences: ["即使服务单位提交成果，也可能因为附件不齐或口径不一致被退回。"],
    },
    archive_manager: {
      roleId: role.id,
      roleName: role.name,
      npcLine: "“没有纪要、催办和版本留痕，后面就只剩口头解释。”",
      concerns: ["资料清单、过程留痕、版本归档和审计证据链。"],
      challenges: [
        "财局意见原件在哪里？",
        "催办记录、会议纪要是否归档？",
        "修改稿每个版本是否可追溯？",
        "销项依据由谁确认？",
      ],
      missingItems: ["没有安排过程资料同步归档，也没有定义销项证据。"],
      recommendedActions: ["建立资料归档清单，归档意见来源、会议纪要、催办记录、修改版本和复核意见。"],
      consequences: ["后续审计、复盘或责任界定时，项目组缺少完整证据链。"],
    },
    consultant: {
      roleId: role.id,
      roleName: role.name,
      npcLine: "“你让我尽快交，但任务边界、输入资料和验收标准要先讲清楚。”",
      concerns: ["任务边界、前置资料、交付标准和合理时限。"],
      challenges: [
        "修改范围是否只针对本次意见？",
        "还缺哪些前置资料或确认口径？",
        "提交成果格式和份数是什么？",
        "逾期后果和配合窗口是否明确？",
      ],
      missingItems: ["对服务单位的任务书不够明确，缺少输入条件、交付格式和提交时点。"],
      recommendedActions: ["向服务单位发出书面任务单，列明修改边界、资料条件、提交成果、完成时间和反馈方式。"],
      consequences: ["服务单位可能以条件不清为由继续拖延，提交成果也可能不满足内部复核要求。"],
    },
  };

  return templates[role.id] ?? fallback;
}

function buildActionPlan(input: GenerateSimulationParams["input"]): ActionPlan {
  const participants = splitParties(input.involvedParties);

  return {
    todayActions: [
      {
        owner: "设计管理人员",
        action: "梳理当前问题涉及的修改意见、资料缺口和成果标准",
        deadline: "今日 12:00 前",
        output: "《问题修改清单》",
        checker: "项目负责人",
      },
      {
        owner: "项目负责人",
        action: "组织相关部门和服务单位召开专题协调会",
        deadline: "今日 15:00 前",
        output: "《专题会议纪要》和《责任节点表》",
        checker: "分管领导或部门负责人",
      },
      {
        owner: "资料档案人员",
        action: "建立过程资料归档目录",
        deadline: "今日下班前",
        output: "《资料归档清单》",
        checker: "项目负责人",
      },
    ],
    tomorrowActions: [
      {
        owner: "服务单位",
        action: "按修改清单提交正式成果或逐条反馈无法完成原因",
        deadline: "明日 18:00 前",
        output: "正式修改稿、逐条回复表和附件包",
        checker: "设计管理人员",
      },
      {
        owner: "前期报批人员",
        action: "同步核对报审路径、附件清单和外部口径",
        deadline: "明日下班前",
        output: "《报审附件核对表》",
        checker: "项目负责人",
      },
    ],
    weeklyActions: [
      {
        owner: "项目负责人",
        action: "完成成果复核、报审准备和问题销项确认",
        deadline: "本周五 17:00 前",
        output: "销项记录、复核意见和报审成果包",
        checker: "分管领导",
      },
    ],
    participants,
    requiredForms: ["问题修改清单", "专题会议纪要", "责任节点表", "报审附件核对表", "资料归档清单", "问题销项表"],
    deliverables: ["正式修改成果", "复核意见", "报审附件包", "过程留痕资料", "销项确认记录"],
    reportingRequirement: "若服务单位未按明日节点提交，或报审路径需要外部协调，由项目负责人当天向分管领导上报。",
    closureMethod: "以成果提交、专业复核、附件核对、资料归档和销项确认五项均完成作为销项标准。",
  };
}

function buildCaseAsset(input: GenerateSimulationParams["input"]) {
  const project = input.projectName || "项目";
  const problem = input.currentProblem;

  return {
    caseName: `${project}多角色推进闭环案例`,
    caseType: "项目统筹 / 设计管理 / 前期报批 / 资料归档",
    exposedProblems: [
      "推进动作停留在通知或催办层面，缺少责任节点表。",
      "成果标准、复核人和销项条件不够明确。",
      "过程资料、会议纪要、催办记录和版本留痕不足。",
    ],
    reusableTemplates: ["问题修改清单", "专题会议纪要", "责任节点表", "报审附件核对表", "资料归档清单", "问题销项表"],
    aiWorkflows: [
      "输入外部意见后自动拆解修改清单",
      "根据责任节点表生成专题会通知和会议纪要模板",
      "根据逾期节点生成催办记录和上报摘要",
      "根据成果复核情况生成销项表",
    ],
    shareableOutputs: [
      {
        title: "复盘摘要",
        usage: "适合发给项目组或作为周会复盘材料",
        content: `【案例复盘摘要】\n${project}在推进过程中暴露出“${problem}”这一问题。复盘发现，原推进方案偏向口头通知和单点催办，缺少责任人、完成时间、成果标准、复核人和资料留痕。后续应由项目负责人牵头建立问题闭环表，明确设计管理、前期报批、服务单位和资料档案等角色分工，并以会议纪要、修改清单、报审附件核对表和销项记录作为闭环依据。`,
      },
      {
        title: "培训案例说明",
        usage: "适合作为内部培训案例开场材料",
        content: `【培训案例】\n案例主题：${project}多角色推进闭环训练。\n案例背景：项目推进中出现“${problem}”。学员需要分别站在总经理、项目负责人、设计管理、前期报批、资料档案和服务单位视角，判断当前方案缺少哪些管理动作。\n训练重点：把“催一下、沟通一下”转化为明确到人、事、时间、成果和检查人的闭环方案。`,
      },
      {
        title: "脱敏分享文案",
        usage: "适合脱敏后发给同事或沉淀到案例库",
        content: `【脱敏案例分享】\n某工程项目前期推进中，外部意见提出后，服务单位成果提交滞后。项目组原计划通过通知对方尽快提交解决问题，但复盘后发现，该动作缺少明确提交时间、成果清单、复核责任和资料留痕。较稳妥的处理方式是：当天形成修改清单和责任节点表，组织专题会压实服务单位提交要求，同步核对报审附件，并将会议纪要、催办记录、成果版本和销项表纳入归档。`,
      },
      {
        ...buildCaseTemplatePackageOutput({
          projectName: project,
          currentProblem: problem,
          proposedAction: input.proposedAction,
          involvedParties: input.involvedParties,
        }),
      },
    ],
    suitableForTraining: true,
    suitableForContent: true,
    desensitizationNotes: "对外分享前需脱敏项目名称、单位名称、金额、审批部门具体人员和内部责任口径。",
  };
}

async function generateLiveSimulation(params: GenerateSimulationParams) {
  if (process.env.NEXT_PUBLIC_PM_PIXEL_LIVE_LLM !== "true") {
    return undefined;
  }

  try {
    const response = await fetch("/api/simulate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.warn("Live LLM simulation failed; falling back to local rules.", await response.text());
      return undefined;
    }

    const result = (await response.json()) as GenerateSimulationResponse;
    return {
      ...result,
      simulationSource: "live_llm" as const,
    };
  } catch (error) {
    console.warn("Live LLM simulation failed; falling back to local rules.", error);
    return undefined;
  }
}

async function generateLocalSimulation({
  input,
  selectedScene,
  selectedRoles,
}: GenerateSimulationParams): Promise<GenerateSimulationResponse> {
  const gapScan = buildGapScan(input.proposedAction);
  const failedCount = gapScan.items.filter((item) => item.status === "fail").length;
  const partialCount = gapScan.items.filter((item) => item.status === "partial").length;
  const levelName = buildLevelName(input.currentProblem, input.projectStage);
  const riskLevel = buildRiskLevel(input.currentProblem, failedCount + Math.floor(partialCount / 2));
  const hiddenRisks = buildHiddenRisks(gapScan.items);

  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    simulationSource: "local_rules",
    levelName,
    riskLevel,
    mainQuest: `在${selectedScene.name}中，将“${input.currentProblem}”转化为责任清楚、节点明确、成果可验收的闭环任务。`,
    hiddenRisks,
    roleResults: selectedRoles.map((role) => roleResult(role, input)),
    gapScan,
    abilityScore: buildAbilityScore(gapScan.items),
    actionPlan: buildActionPlan(input),
    caseAsset: buildCaseAsset(input),
  };
}

export async function generateSimulation(params: GenerateSimulationParams): Promise<GenerateSimulationResponse> {
  const liveResult = await generateLiveSimulation(params);
  if (liveResult) {
    return liveResult;
  }

  return generateLocalSimulation(params);
}

export function getGapStatusLabel(status: GapStatus) {
  return statusLabels[status];
}
