import type { GenerateSimulationParams } from "@/types/simulation";

export function buildSimulationPrompt({ input, selectedScene, selectedRoles }: GenerateSimulationParams) {
  const roles = selectedRoles.map((role) => `${role.name}：${role.title}`).join("\n");

  return `你是“PM Pixel Simulator”的项目管理推演引擎。

产品目标：
用户输入真实工程项目管理问题后，你需要将其转化为像素风格项目关卡，并通过多个角色视角进行推演，帮助用户发现当前推进方案的管理漏洞，训练多角色思考和项目推进能力。

请基于以下输入进行推演：

【项目名称】
${input.projectName}

【项目阶段】
${input.projectStage}

【当前问题】
${input.currentProblem}

【涉及单位 / 人员】
${input.involvedParties || "未填写"}

【用户当前推进方案】
${input.proposedAction}

【选择场景】
${selectedScene.name}：${selectedScene.description}

【选择角色】
${roles}

请严格输出 JSON，不要输出 Markdown，不要输出解释性文字。

JSON 结构如下：

{
  "levelName": "关卡名称",
  "riskLevel": "low | medium | medium_high | high",
  "mainQuest": "本次主线任务",
  "hiddenRisks": ["隐藏风险1", "隐藏风险2"],
  "roleResults": [
    {
      "roleId": "角色ID",
      "roleName": "角色名称",
      "npcLine": "像素 NPC 台词",
      "concerns": ["该角色最关心什么"],
      "challenges": ["该角色会质疑什么"],
      "missingItems": ["用户方案缺什么"],
      "recommendedActions": ["建议补充什么动作"],
      "consequences": ["如果不补强可能造成什么后果"]
    }
  ],
  "gapScan": {
    "items": [
      {
        "key": "goal",
        "label": "目标是否清楚",
        "status": "pass | partial | fail",
        "problem": "存在问题",
        "improvementAction": "补强动作"
      }
    ]
  },
  "abilityScore": {
    "globalView": 0,
    "scheduleControl": 0,
    "responsibilityJudgment": 0,
    "coordination": 0,
    "closure": 0,
    "riskIdentification": 0,
    "evidenceAwareness": 0,
    "reviewAndAssetization": 0,
    "total": 0,
    "deductions": ["扣分原因"],
    "trainingFocus": "本次训练重点"
  },
  "actionPlan": {
    "todayActions": [
      {
        "owner": "责任人",
        "action": "具体动作",
        "deadline": "完成时间",
        "output": "输出成果",
        "checker": "检查人"
      }
    ],
    "tomorrowActions": [],
    "weeklyActions": [],
    "participants": ["参加人员"],
    "requiredForms": ["需要表单"],
    "deliverables": ["输出成果"],
    "reportingRequirement": "是否需要上报",
    "closureMethod": "如何销项"
  },
  "caseAsset": {
    "caseName": "案例名称",
    "caseType": "案例类型",
    "exposedProblems": ["暴露问题"],
    "reusableTemplates": ["可复用模板"],
    "aiWorkflows": ["可形成 AI 工作流"],
    "shareableOutputs": [
      {
        "title": "成果标题",
        "usage": "适用场景",
        "content": "可直接复制分享的完整文本"
      }
    ],
    "suitableForTraining": true,
    "suitableForContent": true,
    "desensitizationNotes": "脱敏建议"
  }
}

要求：
1. 不要泛泛而谈；
2. 每个角色必须有明显不同的视角；
3. 所有行动方案必须明确到人、事、时间、成果；
4. 必须指出用户当前推进方案的漏洞；
5. 必须体现责任、节点、成果、风险、闭环、资料留痕；
6. 能力评分必须有扣分原因；
7. 案例沉淀必须提供至少 3 个 shareableOutputs，且 content 必须是可直接复制给同事或用于培训素材的完整文本；
8. “可复用模板包”不能只列模板名称，必须按当前案例预填具体内容，至少包含问题修改清单、专题会议纪要、责任节点表、报审附件核对表、资料归档清单中的 3 类；
9. 如果信息不足，也要基于现有信息做初步判断，同时指出信息缺口。`;
}
