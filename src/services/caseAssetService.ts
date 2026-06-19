import type { ShareableCaseOutput } from "@/types/simulation";

export interface ShareableOutputSource {
  projectName?: string;
  currentProblem?: string;
  proposedAction?: string;
  involvedParties?: string;
  caseName?: string;
  exposedProblems?: string[];
  reusableTemplates?: string[];
}

function isShareableOutput(value: unknown): value is ShareableCaseOutput {
  const output = value as Partial<ShareableCaseOutput>;
  return Boolean(
    output &&
      typeof output.title === "string" &&
      typeof output.usage === "string" &&
      typeof output.content === "string" &&
      output.title.trim() &&
      output.usage.trim() &&
      output.content.trim(),
  );
}

function uniqueByTitle(outputs: ShareableCaseOutput[]) {
  const usedTitles = new Set<string>();
  return outputs.filter((output) => {
    if (usedTitles.has(output.title)) {
      return false;
    }
    usedTitles.add(output.title);
    return true;
  });
}

function isTemplatePackage(output: ShareableCaseOutput) {
  return output.title.includes("模板");
}

export function buildCaseTemplatePackageOutput(source: ShareableOutputSource): ShareableCaseOutput {
  const project = source.projectName || source.caseName || "项目";
  const problem = source.currentProblem || source.exposedProblems?.[0] || "当前项目管理问题";
  const proposedAction = source.proposedAction || "原方案偏向沟通或催办，需要补充责任、节点、成果和闭环要求";
  const parties = source.involvedParties || "项目负责人、设计管理人员、前期报批人员、服务单位、资料档案人员";

  return {
    title: "可复用模板包",
    usage: "适合作为后续类似问题的工作清单，内容已按本案例预填",
    content: `【可复用模板包：${project}】
适用问题：${problem}
原推进方案：${proposedAction}
涉及单位 / 人员：${parties}

一、《问题修改清单》
| 序号 | 问题或意见 | 责任单位 / 人 | 处理要求 | 完成时间 | 输出成果 | 检查人 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ${problem} | 服务单位 / 设计管理人员 | 将问题拆成逐条处理事项，明确修改范围、输入资料和无法完成原因 | 今日 12:00 前 | 《问题修改清单》初稿 | 项目负责人 | 待办 |
| 2 | 原推进方案只写“${proposedAction}” | 项目负责人 | 将口头推进改为书面责任节点安排 | 今日 15:00 前 | 《责任节点表》 | 分管领导或部门负责人 | 待办 |
| 3 | 成果提交后缺少复核和销项口径 | 设计管理人员 / 前期报批人员 | 明确成果版本、附件清单、复核意见和销项依据 | 明日 18:00 前 | 正式成果包、复核意见、销项记录 | 项目负责人 | 待办 |

二、《专题会议纪要》
会议主题：${project}${problem}闭环协调会
会议时间：今日 15:00
参会单位 / 人员：${parties}
会议结论：
1. 将“${problem}”纳入项目问题闭环管理，今日形成问题清单和责任节点表。
2. 服务单位需按清单提交正式成果或逐条说明无法完成原因。
3. 项目负责人负责跟踪节点偏差，设计管理人员负责成果复核，资料档案人员负责过程留痕。
4. 若明日节点仍未完成，由项目负责人当天向分管领导上报并提出协调事项。

三、《责任节点表》
| 任务 | 责任人 | 配合人 | 截止时间 | 输出成果 | 检查人 | 未完成处理 |
| --- | --- | --- | --- | --- | --- | --- |
| 梳理“${problem}”的处理事项 | 设计管理人员 | 服务单位 | 今日 12:00 前 | 《问题修改清单》 | 项目负责人 | 当日补开协调会确认 |
| 组织专题协调并压实节点 | 项目负责人 | ${parties} | 今日 15:00 前 | 《专题会议纪要》《责任节点表》 | 分管领导或部门负责人 | 形成书面催办 |
| 提交正式成果或逐条反馈 | 服务单位 | 设计管理人员 | 明日 18:00 前 | 正式成果、逐条回复表、附件包 | 设计管理人员 | 当天上报偏差原因 |
| 完成复核、报审准备和销项 | 项目负责人 | 设计管理人员、前期报批人员、资料档案人员 | 本周五 17:00 前 | 复核意见、报审附件包、销项记录 | 分管领导 | 升级协调 |

四、《报审附件核对表》
| 核对项 | 本案例需确认内容 | 当前状态 | 责任人 | 补齐要求 |
| --- | --- | --- | --- | --- |
| 外部意见来源 | “${problem}”对应的意见、依据或通知 | 待归档 | 前期报批人员 | 补齐原件、截图或正式来文 |
| 正式成果版本 | 服务单位提交的最终修改稿 | 待提交 | 服务单位 | 文件名标注日期、版本和修改范围 |
| 内部复核意见 | 设计管理人员对成果完整性和口径的复核 | 待复核 | 设计管理人员 | 写明通过、不通过和需补正事项 |
| 报审附件包 | 报审文本、图纸、估算、说明和相关附件 | 待核对 | 前期报批人员 | 按报审路径逐项打勾确认 |

五、《资料归档清单》
| 资料名称 | 归档来源 | 归档时间 | 归档责任人 | 备注 |
| --- | --- | --- | --- | --- |
| 外部意见或问题来源材料 | 前期报批人员 | 今日下班前 | 资料档案人员 | 支撑“${problem}”的依据 |
| 专题会议纪要 | 项目负责人 | 今日下班前 | 资料档案人员 | 包含责任人、节点和会议结论 |
| 催办记录 / 任务单 | 项目负责人 | 发生当天 | 资料档案人员 | 用于证明已书面推进 |
| 正式成果版本 | 服务单位 | 明日 18:00 后 | 资料档案人员 | 保留提交版本和修改说明 |
| 复核意见和销项记录 | 设计管理人员 / 项目负责人 | 本周五前 | 资料档案人员 | 作为问题闭环依据 |`,
  };
}

function buildFallbackShareableOutputs(source: ShareableOutputSource): ShareableCaseOutput[] {
  const project = source.projectName || source.caseName || "项目";
  const problem = source.currentProblem || source.exposedProblems?.[0] || "当前项目管理问题";
  const exposedProblems = source.exposedProblems?.length ? source.exposedProblems.join("、") : "责任、节点、成果、风险和闭环留痕不够清晰";

  return [
    {
      title: "案例复盘摘要",
      usage: "适合复制到案例库或发给项目组",
      content: `【案例复盘摘要】\n${project}在推进过程中暴露出“${problem}”。复盘发现，核心问题包括：${exposedProblems}。后续应把问题转化为责任人、完成时间、输出成果、检查人和销项依据，形成可检查、可复盘、可追责的闭环推进机制。`,
    },
    {
      title: "脱敏分享文案",
      usage: "适合脱敏后分享给同事或作为培训素材",
      content: `【脱敏案例分享】\n某项目推进中出现“${problem}”。原处理方式偏向沟通和催办，但缺少明确的责任节点、成果标准、复核口径和过程留痕。更稳妥的做法是：当天形成问题清单和责任节点表，组织相关单位确认处理路径，同步明确成果提交标准，并将会议纪要、催办记录、成果版本和销项依据纳入归档。`,
    },
    buildCaseTemplatePackageOutput(source),
  ];
}

export function normalizeShareableOutputs(outputs: unknown, source: ShareableOutputSource) {
  const validOutputs = Array.isArray(outputs) ? outputs.filter(isShareableOutput) : [];
  const templatePackage = buildCaseTemplatePackageOutput(source);
  const nonTemplateOutputs = uniqueByTitle([...validOutputs, ...buildFallbackShareableOutputs(source)]).filter(
    (output) => !isTemplatePackage(output),
  );

  return [...nonTemplateOutputs.slice(0, 3), templatePackage];
}
