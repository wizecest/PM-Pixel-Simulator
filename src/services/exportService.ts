import { normalizeShareableOutputs } from "@/services/caseAssetService";
import type { ActionItem, SimulationRecord } from "@/types/simulation";

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "-").slice(0, 80);
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function actions(items: ActionItem[]) {
  return items
    .map(
      (item, index) =>
        `${index + 1}. ${item.action}\n   - 责任人：${item.owner}\n   - 完成时间：${item.deadline}\n   - 输出成果：${item.output}\n   - 检查人：${item.checker}`,
    )
    .join("\n");
}

function shareableOutputs(record: SimulationRecord) {
  const outputs = normalizeShareableOutputs(record.caseAsset.shareableOutputs, {
    projectName: record.input.projectName,
    currentProblem: record.input.currentProblem,
    proposedAction: record.input.proposedAction,
    involvedParties: record.input.involvedParties,
    caseName: record.caseAsset.caseName,
    exposedProblems: record.caseAsset.exposedProblems,
    reusableTemplates: record.caseAsset.reusableTemplates,
  });

  return outputs.map((output) => `### ${output.title}\n\n用途：${output.usage}\n\n${output.content}`).join("\n\n");
}

export function recordToMarkdown(record: SimulationRecord) {
  return `# ${record.caseAsset.caseName}

## 基本信息

- 项目名称：${record.input.projectName}
- 当前问题：${record.input.currentProblem}
- 原推进方案：${record.input.proposedAction}
- 保存时间：${new Date(record.createdAt).toLocaleString("zh-CN")}
- 推演来源：${record.simulationSource === "live_llm" ? "大模型接口" : "本地规则"}

## 关卡

- 关卡名称：${record.levelName}
- 风险等级：${record.riskLevel}
- 主线任务：${record.mainQuest}

### 隐藏风险

${list(record.hiddenRisks)}

## 角色质疑

${record.roleResults
  .map(
    (role) => `### ${role.roleName}

${role.npcLine}

#### 我最关心什么
${list(role.concerns)}

#### 我会质疑什么
${list(role.challenges)}

#### 你的方案缺什么
${list(role.missingItems)}

#### 我建议补什么动作
${list(role.recommendedActions)}

#### 如果不补强，可能造成什么后果
${list(role.consequences)}`,
  )
  .join("\n\n")}

## 管理漏洞扫描

| 检查项 | 状态 | 存在问题 | 补强动作 |
| --- | --- | --- | --- |
${record.gapScan.items
  .map((item) => `| ${item.label} | ${item.status} | ${item.problem} | ${item.improvementAction} |`)
  .join("\n")}

## 能力评分

- 综合评分：${record.abilityScore.total} / 100
- 全局视野：${record.abilityScore.globalView}
- 节点控制：${record.abilityScore.scheduleControl}
- 责任判断：${record.abilityScore.responsibilityJudgment}
- 协同推进：${record.abilityScore.coordination}
- 闭环能力：${record.abilityScore.closure}
- 风险识别：${record.abilityScore.riskIdentification}
- 证据意识：${record.abilityScore.evidenceAwareness}
- 复盘沉淀：${record.abilityScore.reviewAndAssetization}

### 主要扣分原因

${list(record.abilityScore.deductions)}

### 本次训练重点

${record.abilityScore.trainingFocus}

## 通关方案

### 今天立即做什么

${actions(record.actionPlan.todayActions)}

### 明天推进什么

${actions(record.actionPlan.tomorrowActions)}

### 本周完成什么

${actions(record.actionPlan.weeklyActions)}

### 参加人员

${list(record.actionPlan.participants)}

### 需要表单

${list(record.actionPlan.requiredForms)}

### 输出成果

${list(record.actionPlan.deliverables)}

### 上报要求

${record.actionPlan.reportingRequirement}

### 销项方式

${record.actionPlan.closureMethod}

## 案例沉淀

- 案例类型：${record.caseAsset.caseType}
- 适合培训案例：${record.caseAsset.suitableForTraining ? "是" : "否"}
- 适合内容化：${record.caseAsset.suitableForContent ? "是" : "否"}

### 暴露问题

${list(record.caseAsset.exposedProblems)}

### 可复用模板

${list(record.caseAsset.reusableTemplates)}

### 可形成 AI 工作流

${list(record.caseAsset.aiWorkflows)}

### 可直接分享成果

${shareableOutputs(record)}

### 脱敏建议

${record.caseAsset.desensitizationNotes || "无"}
`;
}

export function downloadRecordMarkdown(record: SimulationRecord) {
  const blob = new Blob([recordToMarkdown(record)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(record.caseAsset.caseName || record.levelName)}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
