# PM Pixel Simulator MVP 产品需求文档

## 1. 产品名称

**PM Pixel Simulator**
中文名：**项目管理像素模拟器**

---

## 2. 产品定位

PM Pixel Simulator 是一个像素风格的工程项目管理角色模拟游戏。

用户输入真实工作中遇到的工程项目管理问题，系统将其转化为一个“项目关卡”。用户通过切换不同项目管理角色，例如总经理、项目负责人、设计管理人员、前期报批人员、现场管理人员、资料档案人员、服务单位等，体验不同岗位的判断逻辑、质疑方式、信息缺口和行动要求。

系统最终对用户当前推进方案进行管理漏洞扫描、能力评分，并输出修正版推进方案，帮助用户训练多视角思考能力、问题诊断能力和项目推进能力。

---

## 3. MVP 核心目标

第一版不做复杂游戏引擎，不做地图移动，不做账号系统，不做数据库。

MVP 只验证一个核心闭环：

```text
输入真实工作问题
→ 生成像素化项目关卡
→ 切换不同角色
→ 输出角色质疑
→ 扫描管理漏洞
→ 输出能力评分
→ 生成修正版行动方案
→ 保存为案例记录
```

---

## 4. 目标用户

### 4.1 核心用户

工程项目管理人员，尤其是：

* 代建单位项目负责人；
* 甲方设计管理人员；
* 政府投资项目前期管理人员；
* 工程现场管理人员；
* 部门负责人后备人员；
* 希望提升项目统筹能力的年轻项目管理人员。

### 4.2 用户痛点

1. 工作中遇到问题时，容易只站在自己岗位视角思考；
2. 推进方案常停留在“催一下、沟通一下、协调一下”，缺少责任、节点、成果和闭环；
3. 汇报时容易罗列流水账，不会表达偏差、原因、措施和升级需求；
4. 缺少模拟上级、职能部门、服务单位、资料管理等多角色视角的训练环境；
5. 真实项目问题没有沉淀成案例、模板和能力训练材料。

---

## 5. MVP 成功标准

MVP 完成后，应满足以下标准：

1. 用户可以输入一个真实项目问题；
2. 系统可以生成一个像素风格的项目关卡页面；
3. 用户可以选择至少 6 个角色进行视角切换；
4. 每个角色能够基于职责输出不同质疑，不是重复泛泛建议；
5. 系统能够对用户推进方案进行管理漏洞扫描；
6. 系统能够输出能力评分；
7. 系统能够生成一版明确到人、事、时间、成果的修正版推进方案；
8. 用户可以将本次推演保存到本地历史记录；
9. 历史记录可以重新打开查看。

---

## 6. 产品边界

### 6.1 MVP 必须做

* 问题输入；
* 场景生成；
* 角色选择；
* 多角色质疑；
* 管理漏洞扫描；
* 能力评分；
* 修正版行动方案；
* 本地历史记录；
* 像素风 UI。

### 6.2 MVP 暂不做

* 用户登录；
* 云端数据库；
* 多人协作；
* 复杂动画；
* 角色移动；
* 战斗系统；
* 装备系统；
* 积分商城；
* 权限管理；
* 文件上传；
* 项目台账同步；
* Obsidian / 飞书同步；
* 真正游戏引擎。

---

## 7. 核心用户流程

### 7.1 新建模拟

```text
首页
→ 输入工作问题
→ 点击“开始模拟”
→ 进入关卡生成页
→ 选择场景
→ 选择角色
→ 查看 NPC 质疑
→ 查看漏洞扫描
→ 查看能力评分
→ 查看修正版推进方案
→ 保存案例
```

### 7.2 查看历史记录

```text
首页
→ 点击“历史案例”
→ 查看历史推演列表
→ 点击某条记录
→ 打开推演结果详情
```

---

## 8. 页面设计

## 8.1 首页：问题输入页

### 页面目标

让用户输入真实工作问题，并开始一次模拟。

### 页面元素

1. 产品标题；
2. 像素风公司总部背景；
3. 输入表单；
4. 开始按钮；
5. 历史记录入口。

### 输入字段

| 字段        | 类型                    | 必填 | 说明                                      |
| --------- | --------------------- | -- | --------------------------------------- |
| 项目名称      | text                  | 是  | 例如：小石嘴片区旅游基础配套项目                        |
| 项目阶段      | select                | 是  | 前期策划、可研、方案设计、初设、施工图、招采、施工、验收、结算、其他      |
| 当前问题      | textarea              | 是  | 描述工作中遇到的问题                              |
| 涉及单位 / 人员 | textarea              | 否  | 例如：项目负责人、设计单位、前期部、财局                    |
| 我的推进方案    | textarea              | 是  | 用户当前准备怎么处理                              |
| 期望训练能力    | select / multi-select | 否  | 全局视野、节点控制、责任判断、协同推进、闭环能力、风险识别、证据意识、复盘沉淀 |

### 按钮

* `开始模拟`
* `查看历史案例`

---

## 8.2 场景选择页

### 页面目标

把用户输入的问题包装成一个像素风项目关卡。

### 场景选项

| 场景 ID             | 场景名称    | 适用问题             |
| ----------------- | ------- | ---------------- |
| gm_office         | 总经理办公室  | 责任、机制、重大偏差、问责    |
| project_meeting   | 项目督导会议室 | 汇报、协调、会议决议、节点偏差  |
| design_dept       | 设计管理部   | 方案、可研、图纸、设计修改    |
| approval_window   | 前期报批窗口  | 报批、政府沟通、附件、审批路径  |
| construction_site | 工程现场    | 进度、质量、安全、资源投入    |
| archive_room      | 资料档案室   | 资料归档、证据链、审计风险    |
| consultant_office | 服务单位办公室 | 设计单位、咨询单位、施工单位履约 |

### 页面输出

系统根据输入自动生成：

* 关卡名称；
* 风险等级；
* 主线任务；
* 隐藏风险；
* 推荐角色。

### 示例

```text
关卡名称：可研修改滞后危机
风险等级：中高
主线任务：在本周内形成可报审修改稿
隐藏风险：修改清单缺失、报审路径不清、缺少催办留痕
推荐角色：总经理、项目负责人、设计管理人员、前期报批人员、资料档案人员、设计单位
```

---

## 8.3 角色选择页

### 页面目标

让用户选择本次模拟要切换的角色。

### MVP 默认角色

| 角色 ID                 | 角色名称   | 核心视角             |
| --------------------- | ------ | ---------------- |
| general_manager       | 总经理    | 看系统、抓责任、定机制、看结果  |
| deputy_leader         | 分管领导   | 协调资源、压实条线、推动重点问题 |
| project_leader        | 项目负责人  | 控节点、抓协同、闭问题、报风险  |
| design_manager        | 设计管理人员 | 控成果、控质量、控修改、控版本  |
| approval_manager      | 前期报批人员 | 看路径、看附件、看审批口径    |
| cost_contract_manager | 造价合约人员 | 看投资、合同、招采、变更边界   |
| site_manager          | 现场管理人员 | 看人机料、进度、质量、安全    |
| archive_manager       | 资料档案人员 | 看资料清单、归档、证据链     |
| consultant            | 服务单位   | 看任务边界、资料条件、交付压力  |
| government_officer    | 政府部门   | 看合规、程序、审批条件、报审材料 |

### MVP 最低要求

第一版至少实现以下 6 个角色：

1. 总经理；
2. 项目负责人；
3. 设计管理人员；
4. 前期报批人员；
5. 资料档案人员；
6. 服务单位。

---

## 8.4 推演页：NPC 角色质疑

### 页面目标

展示不同角色对用户当前推进方案的质疑和建议。

### 每个角色输出结构

```text
角色名称：
像素 NPC 台词：

一、我最关心什么
二、我会质疑什么
三、你的方案缺什么
四、我建议补什么动作
五、如果不补强，可能造成什么后果
```

### 示例：总经理角色

```text
【NPC 总经理】

“你说设计单位慢，我不接受这个表述。我要看的是节点偏差、责任动作和闭环结果。”

一、我最关心什么
这个问题是否影响项目总节点，项目负责人是否已经采取有效管理动作。

二、我会质疑什么
1. 原计划什么时候完成？
2. 当前实际完成到什么程度？
3. 项目负责人什么时候发现问题？
4. 有没有形成书面催办？
5. 有没有向分管领导上报？

三、你的方案缺什么
你的方案只写了通知设计单位尽快提交，没有明确责任人、完成时间、成果标准和复核机制。

四、我建议补什么动作
由项目负责人牵头，今天组织设计管理、前期部、设计单位召开专题会，形成修改清单和节点表。

五、如果不补强，可能造成什么后果
设计单位继续拖延，项目负责人无法说明偏差原因，后续可研报审节点可能延误。
```

---

## 8.5 管理漏洞扫描页

### 页面目标

用固定检查项扫描用户原推进方案是否完整。

### 检查项

| 检查项    | 说明                  |
| ------ | ------------------- |
| 目标是否清楚 | 是否明确要达成什么结果         |
| 责任是否明确 | 是否明确主责人、协同人、检查人     |
| 节点是否明确 | 是否有具体完成时间           |
| 成果是否明确 | 是否明确提交什么文件、表单、成果    |
| 协同是否明确 | 是否明确需要哪些部门 / 单位参与   |
| 风险是否识别 | 是否识别后续影响和风险等级       |
| 资料是否归档 | 是否考虑会议纪要、催办、版本、资料留存 |
| 是否形成闭环 | 是否有反馈、复核、销项         |
| 是否需要上报 | 是否判断是否需要分管领导或公司协调   |
| 是否可追责  | 是否有书面依据和责任口径        |

### 输出格式

| 检查项    | 状态  | 存在问题              | 补强动作                  |
| ------ | --- | ----------------- | --------------------- |
| 目标是否清楚 | 不通过 | 只说“尽快提交”，没有明确成果标准 | 明确提交可研修改稿、估算表、修改说明    |
| 节点是否明确 | 不通过 | 没有具体完成时间          | 明确设计单位提交时间和公司复核时间     |
| 资料是否归档 | 不通过 | 没有考虑过程资料留存        | 归档财局意见、会议纪要、催办记录、修改版本 |

### 状态枚举

* `通过`
* `部分通过`
* `不通过`

---

## 8.6 能力评分页

### 页面目标

对用户本次推进方案进行能力维度评分。

### 评分维度

| 能力   | 含义                  |
| ---- | ------------------- |
| 全局视野 | 是否能从项目全周期和公司管理角度看问题 |
| 节点控制 | 是否识别计划偏差和关键节点       |
| 责任判断 | 是否区分第一责任、直接责任、协同责任  |
| 协同推进 | 是否组织相关部门和单位共同解决     |
| 闭环能力 | 是否形成任务、反馈、复核、销项机制   |
| 风险识别 | 是否发现报批、设计、施工、资料等风险  |
| 证据意识 | 是否保留会议、催办、版本、整改记录   |
| 复盘沉淀 | 是否能沉淀案例、模板、工作流      |

### 评分规则

每项 0-100 分。

综合评分为 8 项平均分。

### 输出格式

```text
本次关卡评分：72 / 100

全局视野：75
节点控制：65
责任判断：70
协同推进：80
闭环能力：60
风险识别：78
证据意识：55
复盘沉淀：82

主要扣分原因：
1. 没有明确设计单位提交时间；
2. 没有形成修改清单；
3. 没有设置成果复核人；
4. 没有考虑资料归档和催办留痕。

本次训练重点：
你的短板不是不知道要推进，而是推进动作没有节点化、成果化和闭环化。
```

---

## 8.7 通关方案页

### 页面目标

输出一版修正版项目推进方案。

### 输出结构

```text
【通关方案】

一、今天立即做什么
二、明天推进什么
三、本周完成什么
四、找谁参加
五、形成什么表单
六、输出什么成果
七、何时反馈
八、是否需要上报
九、如何销项
```

### 要求

每项动作必须明确：

* 责任人；
* 配合人；
* 完成时间；
* 输出成果；
* 检查人。

### 示例

```text
一、今天立即做什么

1. 由设计管理人员在今日 12:00 前整理《财局意见可研修改清单》。
2. 由项目负责人在今日 15:00 组织设计单位、前期部、设计管理人员召开专题会。
3. 会后形成《专题会议纪要》和《设计修改闭环表》。

二、明天推进什么

1. 设计单位在明日 18:00 前提交可研修改稿。
2. 设计管理人员在收到后 1 个工作日内完成复核。
3. 前期报批人员同步确认报审附件清单。

三、本周完成什么

1. 完成可研修改稿复核；
2. 完成报审资料汇总；
3. 向财局提交修改成果或形成送审准备。
```

---

## 8.8 案例沉淀页

### 页面目标

将一次模拟结果沉淀为可复用资产。

### 输出内容

```text
案例名称：
例如：可研修改滞后下的多角色推进闭环案例

案例类型：
设计管理 / 前期报批 / 项目统筹 / 资料归档 / 会议督办

暴露问题：
例如：设计修改缺少清单化、节点化、闭环化管理。

可复用模板：
1. 设计修改清单；
2. 专题会议纪要；
3. 问题风险清单；
4. 会议决议销项表；
5. 资料归档清单。

可形成 AI 工作流：
输入财局意见 → 自动拆解修改清单 → 生成专题会通知 → 生成会议纪要模板 → 生成催办记录 → 生成销项表。

是否适合培训案例：
是。

是否适合内容化：
是，但需脱敏项目名称、单位名称和具体金额。
```

---

## 9. 数据结构设计

## 9.1 ScenarioInput

```ts
export type ProjectStage =
  | "planning"
  | "feasibility"
  | "scheme_design"
  | "preliminary_design"
  | "construction_drawing"
  | "procurement"
  | "construction"
  | "acceptance"
  | "settlement"
  | "other";

export interface ScenarioInput {
  id: string;
  projectName: string;
  projectStage: ProjectStage;
  currentProblem: string;
  involvedParties?: string;
  proposedAction: string;
  trainingGoals?: string[];
  createdAt: string;
}
```

---

## 9.2 Role

```ts
export interface Role {
  id: string;
  name: string;
  title: string;
  avatar: string;
  focus: string[];
  defaultQuestions: string[];
  decisionCriteria: string[];
}
```

---

## 9.3 Scene

```ts
export interface Scene {
  id: string;
  name: string;
  description: string;
  suitableStages: ProjectStage[];
  recommendedRoles: string[];
}
```

---

## 9.4 RoleSimulationResult

```ts
export interface RoleSimulationResult {
  roleId: string;
  roleName: string;
  npcLine: string;
  concerns: string[];
  challenges: string[];
  missingItems: string[];
  recommendedActions: string[];
  consequences: string[];
}
```

---

## 9.5 GapScanResult

```ts
export type GapStatus = "pass" | "partial" | "fail";

export interface GapScanItem {
  key: string;
  label: string;
  status: GapStatus;
  problem: string;
  improvementAction: string;
}

export interface GapScanResult {
  items: GapScanItem[];
}
```

---

## 9.6 AbilityScore

```ts
export interface AbilityScore {
  globalView: number;
  scheduleControl: number;
  responsibilityJudgment: number;
  coordination: number;
  closure: number;
  riskIdentification: number;
  evidenceAwareness: number;
  reviewAndAssetization: number;
  total: number;
  deductions: string[];
  trainingFocus: string;
}
```

---

## 9.7 ActionPlan

```ts
export interface ActionPlan {
  todayActions: ActionItem[];
  tomorrowActions: ActionItem[];
  weeklyActions: ActionItem[];
  participants: string[];
  requiredForms: string[];
  deliverables: string[];
  reportingRequirement: string;
  closureMethod: string;
}

export interface ActionItem {
  owner: string;
  action: string;
  deadline: string;
  output: string;
  checker: string;
}
```

---

## 9.8 CaseAsset

```ts
export interface CaseAsset {
  caseName: string;
  caseType: string;
  exposedProblems: string[];
  reusableTemplates: string[];
  aiWorkflows: string[];
  suitableForTraining: boolean;
  suitableForContent: boolean;
  desensitizationNotes?: string;
}
```

---

## 9.9 SimulationRecord

```ts
export interface SimulationRecord {
  id: string;
  input: ScenarioInput;
  selectedSceneId: string;
  selectedRoleIds: string[];
  roleResults: RoleSimulationResult[];
  gapScan: GapScanResult;
  abilityScore: AbilityScore;
  actionPlan: ActionPlan;
  caseAsset: CaseAsset;
  createdAt: string;
}
```

---

## 10. 本地 JSON 配置

## 10.1 roles.json

第一版可配置以下角色：

```json
[
  {
    "id": "general_manager",
    "name": "总经理",
    "title": "看系统、抓责任、定机制、看结果",
    "avatar": "/avatars/general-manager.png",
    "focus": ["系统问题", "责任边界", "结果交付", "机制建设", "人员考核"],
    "defaultQuestions": [
      "当前偏差是什么？",
      "谁是第一责任人？",
      "项目负责人采取了什么管理动作？",
      "为什么没有提前预警？",
      "是否需要公司层面协调？",
      "如何避免同类问题复发？"
    ],
    "decisionCriteria": [
      "是否影响项目总目标",
      "是否存在责任不清",
      "是否存在过程失管",
      "是否存在不上报",
      "是否需要机制修补"
    ]
  },
  {
    "id": "project_leader",
    "name": "项目负责人",
    "title": "控节点、抓协同、闭问题、报风险",
    "avatar": "/avatars/project-leader.png",
    "focus": ["节点总控", "部门协同", "问题闭环", "风险上报"],
    "defaultQuestions": [
      "总控节点表在哪里？",
      "当前偏差影响哪个后续节点？",
      "哪些部门或单位没有配合到位？",
      "问题是否纳入风险清单？",
      "是否已经催办并留痕？"
    ],
    "decisionCriteria": [
      "节点是否清楚",
      "责任是否明确",
      "协同是否到位",
      "是否有升级预案"
    ]
  },
  {
    "id": "design_manager",
    "name": "设计管理人员",
    "title": "控成果、控质量、控修改、控版本",
    "avatar": "/avatars/design-manager.png",
    "focus": ["设计成果", "修改清单", "技术质量", "版本控制"],
    "defaultQuestions": [
      "设计任务是否明确？",
      "修改意见是否逐条拆解？",
      "成果是否满足报审和施工要求？",
      "文本、图纸、估算是否一致？",
      "是否形成设计修改闭环？"
    ],
    "decisionCriteria": [
      "设计边界是否清楚",
      "成果质量是否达标",
      "修改是否闭环",
      "版本是否可追溯"
    ]
  },
  {
    "id": "approval_manager",
    "name": "前期报批人员",
    "title": "看路径、看附件、看审批口径",
    "avatar": "/avatars/approval-manager.png",
    "focus": ["报批路径", "报审附件", "审批口径", "外部协调"],
    "defaultQuestions": [
      "报审路径是否明确？",
      "附件是否齐全？",
      "政府部门口径是否确认？",
      "是否存在退件风险？",
      "是否需要领导出面协调？"
    ],
    "decisionCriteria": [
      "是否满足报审条件",
      "是否存在程序风险",
      "是否需要补充材料"
    ]
  },
  {
    "id": "archive_manager",
    "name": "资料档案人员",
    "title": "看资料清单、归档、证据链",
    "avatar": "/avatars/archive-manager.png",
    "focus": ["资料清单", "应归未归", "证据链", "审计风险"],
    "defaultQuestions": [
      "会议纪要是否归档？",
      "催办记录是否留存？",
      "成果版本是否留存？",
      "应归未归资料有哪些？",
      "后续审计是否有证据支撑？"
    ],
    "decisionCriteria": [
      "资料是否同步归档",
      "证据链是否完整",
      "是否存在后补资料风险"
    ]
  },
  {
    "id": "consultant",
    "name": "服务单位",
    "title": "看任务边界、资料条件、交付压力",
    "avatar": "/avatars/consultant.png",
    "focus": ["任务边界", "前置资料", "交付要求", "时限压力"],
    "defaultQuestions": [
      "任务要求是否明确？",
      "修改边界是否清楚？",
      "是否缺少前置资料？",
      "提交成果格式是否明确？",
      "时限是否合理？"
    ],
    "decisionCriteria": [
      "任务是否清晰",
      "资料是否齐全",
      "交付标准是否明确"
    ]
  }
]
```

---

## 10.2 scenes.json

```json
[
  {
    "id": "project_meeting",
    "name": "项目督导会议室",
    "description": "适合模拟项目汇报、节点偏差、会议追问和决议销项。",
    "suitableStages": ["planning", "feasibility", "scheme_design", "construction", "settlement", "other"],
    "recommendedRoles": ["general_manager", "project_leader", "design_manager", "approval_manager", "archive_manager"]
  },
  {
    "id": "design_dept",
    "name": "设计管理部",
    "description": "适合模拟设计成果质量、设计修改、设计变更和版本控制。",
    "suitableStages": ["feasibility", "scheme_design", "preliminary_design", "construction_drawing"],
    "recommendedRoles": ["project_leader", "design_manager", "consultant", "archive_manager"]
  },
  {
    "id": "approval_window",
    "name": "前期报批窗口",
    "description": "适合模拟报批路径、政府沟通、资料附件和审批口径。",
    "suitableStages": ["planning", "feasibility", "scheme_design", "preliminary_design"],
    "recommendedRoles": ["project_leader", "approval_manager", "design_manager", "consultant"]
  },
  {
    "id": "archive_room",
    "name": "资料档案室",
    "description": "适合模拟资料缺失、归档滞后、审计证据链和销项管理。",
    "suitableStages": ["planning", "feasibility", "construction", "acceptance", "settlement", "other"],
    "recommendedRoles": ["project_leader", "archive_manager", "general_manager"]
  }
]
```

---

## 11. LLM 推演服务

## 11.1 服务名称

`simulationService`

## 11.2 输入

```ts
interface GenerateSimulationParams {
  input: ScenarioInput;
  selectedScene: Scene;
  selectedRoles: Role[];
}
```

## 11.3 输出

```ts
interface GenerateSimulationResponse {
  levelName: string;
  riskLevel: "low" | "medium" | "medium_high" | "high";
  mainQuest: string;
  hiddenRisks: string[];
  roleResults: RoleSimulationResult[];
  gapScan: GapScanResult;
  abilityScore: AbilityScore;
  actionPlan: ActionPlan;
  caseAsset: CaseAsset;
}
```

---

## 11.4 LLM Prompt 模板

```text
你是“PM Pixel Simulator”的项目管理推演引擎。

产品目标：
用户输入真实工程项目管理问题后，你需要将其转化为像素风格项目关卡，并通过多个角色视角进行推演，帮助用户发现当前推进方案的管理漏洞，训练多角色思考和项目推进能力。

请基于以下输入进行推演：

【项目名称】
{{projectName}}

【项目阶段】
{{projectStage}}

【当前问题】
{{currentProblem}}

【涉及单位 / 人员】
{{involvedParties}}

【用户当前推进方案】
{{proposedAction}}

【选择场景】
{{sceneName}}：{{sceneDescription}}

【选择角色】
{{roles}}

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
7. 如果信息不足，也要基于现有信息做初步判断，同时指出信息缺口。
```

---

## 12. 前端组件建议

### 12.1 目录结构

```text
src/
  app/
    page.tsx
    simulate/
      page.tsx
    history/
      page.tsx
    history/[id]/
      page.tsx
  components/
    PixelLayout.tsx
    PixelButton.tsx
    PixelCard.tsx
    ScenarioForm.tsx
    SceneSelector.tsx
    RoleSelector.tsx
    RoleDialogueCard.tsx
    GapScanTable.tsx
    AbilityScorePanel.tsx
    ActionPlanPanel.tsx
    CaseAssetPanel.tsx
  data/
    roles.json
    scenes.json
    checkItems.json
  services/
    simulationService.ts
    storageService.ts
  types/
    simulation.ts
  styles/
    globals.css
```

---

## 12.2 核心组件说明

### ScenarioForm

负责输入项目问题。

Props：

```ts
interface ScenarioFormProps {
  onSubmit: (input: ScenarioInput) => void;
}
```

---

### SceneSelector

负责选择场景。

Props：

```ts
interface SceneSelectorProps {
  scenes: Scene[];
  selectedSceneId?: string;
  onSelect: (sceneId: string) => void;
}
```

---

### RoleSelector

负责选择角色。

Props：

```ts
interface RoleSelectorProps {
  roles: Role[];
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
}
```

---

### RoleDialogueCard

展示单个角色推演结果。

Props：

```ts
interface RoleDialogueCardProps {
  result: RoleSimulationResult;
}
```

---

### GapScanTable

展示管理漏洞扫描结果。

Props：

```ts
interface GapScanTableProps {
  gapScan: GapScanResult;
}
```

---

### AbilityScorePanel

展示能力评分。

Props：

```ts
interface AbilityScorePanelProps {
  score: AbilityScore;
}
```

---

### ActionPlanPanel

展示修正版推进方案。

Props：

```ts
interface ActionPlanPanelProps {
  actionPlan: ActionPlan;
}
```

---

### CaseAssetPanel

展示案例沉淀结果。

Props：

```ts
interface CaseAssetPanelProps {
  caseAsset: CaseAsset;
}
```

---

## 13. localStorage 存储设计

### Key

```ts
const STORAGE_KEY = "pm_pixel_simulator_records";
```

### storageService

```ts
export function getRecords(): SimulationRecord[];

export function getRecordById(id: string): SimulationRecord | undefined;

export function saveRecord(record: SimulationRecord): void;

export function deleteRecord(id: string): void;

export function clearRecords(): void;
```

---

## 14. UI 风格要求

### 14.1 视觉风格

* 像素风；
* 深色背景；
* 像素边框；
* 卡片式布局；
* 角色头像卡片；
* 对话框样式；
* 类似复古 RPG 菜单；
* 不追求复杂动画，优先可读性。

### 14.2 色彩建议

* 背景：深蓝黑 / 深灰；
* 卡片：深灰或墨绿；
* 文字：浅灰 / 米白；
* 强调色：黄色 / 青色；
* 警告：红色或橙色；
* 通过状态：绿色；
* 不通过状态：红色；
* 部分通过状态：黄色。

### 14.3 字体建议

如果项目允许引入外部字体，可使用像素风字体。
如果不想依赖外部资源，使用 CSS 模拟像素风即可。

---

## 15. 交互要求

### 15.1 基本交互

1. 点击“开始模拟”后，如果必填项为空，提示用户补充；
2. 角色至少选择 3 个，建议默认选择 5 个；
3. 点击“生成推演”后显示 loading 状态；
4. LLM 返回失败时，显示错误提示，并允许重试；
5. 推演结果生成后，用户可以保存案例；
6. 保存后可在历史记录中查看。

### 15.2 默认角色选择逻辑

根据项目阶段自动推荐角色。

示例：

```ts
if projectStage === "feasibility":
  recommendedRoles = [
    "general_manager",
    "project_leader",
    "design_manager",
    "approval_manager",
    "archive_manager",
    "consultant"
  ]
```

---

## 16. 异常处理

### 16.1 LLM 返回非 JSON

处理方式：

1. 尝试提取 JSON；
2. 如果解析失败，提示“推演结果解析失败，请重试”；
3. 记录原始输出到 console，便于调试。

### 16.2 LLM 调用失败

提示：

```text
推演生成失败。请检查网络或 API 配置后重试。
```

### 16.3 localStorage 失败

提示：

```text
保存失败，当前浏览器可能禁用了本地存储。
```

---

## 17. 验收标准

## 17.1 功能验收

### 场景一：完整推演

输入：

```text
项目名称：小石嘴片区旅游基础配套项目
项目阶段：可研
当前问题：财局提出修改意见后，设计单位迟迟未提交正式修改稿。
涉及单位：项目负责人、设计管理人员、前期部、设计单位、财局
我的推进方案：明天通知设计单位尽快提交修改稿。
```

期望结果：

1. 系统生成关卡名称；
2. 风险等级为 medium 或 medium_high；
3. 至少输出 5 个角色质疑；
4. 总经理、设计管理、前期报批、资料档案、服务单位的视角明显不同；
5. 漏洞扫描应指出“尽快”不是节点；
6. 行动方案应包含修改清单、专题会、提交时间、复核人、报审附件、归档资料；
7. 能力评分应指出节点控制和证据意识不足；
8. 可以保存为历史案例；
9. 历史案例可以重新打开。

---

## 17.2 UI 验收

1. 页面具备明显像素风；
2. 表单可正常输入；
3. 角色卡片可选择；
4. 推演结果分模块展示；
5. 移动端基本可读；
6. 深色背景下文字清晰。

---

## 17.3 代码验收

1. TypeScript 无明显类型错误；
2. 组件职责清晰；
3. 本地 JSON 配置可独立修改；
4. LLM 调用封装在 service 中；
5. localStorage 逻辑封装在 service 中；
6. 不在组件中硬编码大段 Prompt；
7. 不引入不必要的复杂状态管理库；
8. MVP 不接入数据库。

---

## 18. 开发优先级

### P0 必须完成

* 首页输入；
* 场景选择；
* 角色选择；
* LLM 推演；
* 角色质疑展示；
* 漏洞扫描展示；
* 能力评分展示；
* 通关方案展示；
* 本地保存历史记录。

### P1 可选完成

* 历史记录删除；
* 复制 Markdown；
* 导出 Markdown；
* 根据项目阶段自动推荐场景和角色；
* 简单像素头像。

### P2 暂缓

* 登录；
* 云端同步；
* 复杂动画；
* 地图移动；
* 关卡系统；
* 成就系统；
* 多人协作；
* 文件上传；
* Obsidian 同步；
* 飞书同步。

---

## 19. 给 Codex 的开发任务说明

请按以下顺序开发，不要一次性做复杂功能。

### Step 1：创建项目基础结构

* 使用 Next.js + TypeScript；
* 配置 Tailwind CSS；
* 创建基础页面；
* 创建全局像素风样式；
* 创建基础组件 PixelButton、PixelCard、PixelLayout。

### Step 2：实现输入表单

* 创建 ScenarioForm；
* 完成必填校验；
* 表单提交后进入模拟流程。

### Step 3：添加本地配置

* 创建 roles.json；
* 创建 scenes.json；
* 创建 TypeScript 类型定义。

### Step 4：实现场景和角色选择

* 创建 SceneSelector；
* 创建 RoleSelector；
* 根据阶段推荐默认角色；
* 至少允许选择 3 个角色。

### Step 5：实现 LLM Service

* 创建 simulationService；
* 封装 Prompt；
* 调用 LLM API；
* 返回结构化 JSON；
* 增加错误处理。

### Step 6：实现结果展示

* RoleDialogueCard；
* GapScanTable；
* AbilityScorePanel；
* ActionPlanPanel；
* CaseAssetPanel。

### Step 7：实现历史记录

* 创建 storageService；
* 保存 SimulationRecord；
* 历史列表页；
* 历史详情页；
* 删除记录。

### Step 8：打磨 UI

* 像素边框；
* 深色主题；
* 角色头像占位；
* 状态颜色；
* loading 状态；
* error 状态。

---

## 20. Codex 开发提示词

```text
你是资深前端工程师。请基于以下 PRD 开发一个 MVP Web App：PM Pixel Simulator。

开发原则：
1. 正确性优先；
2. 只实现 PRD 中的 MVP 功能；
3. 不做未要求的复杂功能；
4. 保持代码简单；
5. 使用 TypeScript；
6. 组件职责清晰；
7. 不引入不必要的状态管理库；
8. LLM 调用必须封装到 service；
9. localStorage 存储必须封装到 service；
10. 角色和场景使用本地 JSON 配置。

技术栈：
- Next.js
- TypeScript
- Tailwind CSS
- localStorage

目标：
开发一个像素风格的工程项目管理角色模拟器。用户输入真实工作问题后，选择场景和角色，系统调用 LLM 生成多角色质疑、管理漏洞扫描、能力评分、修正版推进方案和案例沉淀结果，并允许保存到本地历史记录。

请先完成项目结构、类型定义、本地 JSON 配置和静态 UI，再接入 LLM service。不要一开始就做复杂动画、登录、数据库或游戏引擎。
```

---

## 21. 后续版本方向

MVP 验证通过后，再考虑：

1. 增加更多角色；
2. 增加真实项目案例库；
3. 增加关卡系统；
4. 增加每周能力成长曲线；
5. 增加 Obsidian Markdown 导出；
6. 增加会议模拟 Boss 战；
7. 增加项目管理知识卡；
8. 增加团队培训模式；
9. 增加自定义公司制度库；
10. 接入真实项目台账。

---

# 结论

PM Pixel Simulator 的 MVP 不应追求完整游戏，而应优先验证核心训练闭环：

```text
真实问题输入
→ 多角色视角切换
→ 管理漏洞识别
→ 推进动作修正
→ 能力评分
→ 案例沉淀
```

只要这个闭环跑通，像素风 UI 就能成为一个有效的训练入口。后续再逐步增加游戏化元素。
