# PM Pixel Simulator 游戏化迭代执行指令

本文档用于交给其它大模型、Codex、Cursor、Claude Code、Replit Agent、v0 或类似平台执行。目标不是重做 PM Pixel Simulator，而是在现有 MVP 和案例库能力基础上，逐步加入可验证、可回退、服务训练目标的游戏化体验。

## 一句话目标

把当前“输入问题 -> 多角色推演 -> 漏洞扫描 -> 通关方案 -> 案例沉淀”的工具，迭代为“项目关卡训练游戏”：用户每次推演都能看到通关结算、任务完成度、经验成长、能力徽章、复盘建议和再次挑战入口。

## 当前基线

执行前必须先核查实际代码。若代码与本节不一致，以实际代码为准，并先在执行报告中说明差异。

当前项目是 Next.js + React + TypeScript + Tailwind 的本地应用：

- 入口页：`src/app/page.tsx`
- 推演页：`src/app/simulate/page.tsx`
- 历史列表：`src/app/history/page.tsx`
- 历史详情：`src/app/history/[id]/page.tsx`
- 结果展示：`src/components/SimulationResultView.tsx`
- 核心类型：`src/types/simulation.ts`
- 本地/大模型推演：`src/services/simulationService.ts`
- 提示词：`src/services/promptTemplate.ts`
- 历史存储：`src/services/storageService.ts`
- 案例质量核查：`src/services/caseQualityService.ts`
- 案例结构化标签：`src/services/caseLibraryService.ts`
- 复制到工作材料：`src/services/caseAssetService.ts`

当前已具备或部分具备：

- 创建项目问题推演。
- 选择场景和角色。
- 生成多角色质疑、漏洞扫描、能力评分、行动方案、案例沉淀。
- 保存历史案例。
- 历史案例质量核查。
- 案例库结构化标签。
- 复制到工作材料。
- 导出 Markdown 和建议包 JSON。

因此，下一步游戏化不要重复实现这些能力，应围绕“结算反馈、成长、挑战、复盘动机”补足体验。

## 关键假设

1. 当前核心训练闭环已经能运行，游戏化只增强反馈和动机，不改变推演主流程。
2. `storage/simulation-records.json` 可能包含真实项目内容，不能提交、不能外泄、不能在回答中复述案例正文。
3. `E:\pm-obsidian` 是真实项目状态源，PM Pixel Simulator 只读项目快照或数据库，不自动写回真实项目。
4. 本阶段仍保持本地 MVP，不引入登录、云数据库、多人协作、权限系统、复杂地图移动或战斗系统。
5. XP、等级、徽章、任务完成度先用确定性代码计算，不依赖大模型输出，避免同一案例反复生成不同成长结果。
6. 所有新增字段必须兼容旧历史案例。旧案例缺字段时，页面不能报错。

## 不做什么

不要在本轮游戏化中做：

- 用户账号、云同步、排行榜。
- 复杂 2D 地图移动、战斗、抽卡、装备系统。
- 自动修改 Obsidian、飞书或真实项目资料。
- 大规模 UI 重构。
- 重写 `storage/simulation-records.json` 的迁移脚本。
- 把真实案例正文写入提交信息、PR 描述或答复。
- 为了游戏化加入与项目管理训练无关的奖励。

## 游戏化原则

游戏化必须服务项目管理训练，而不是单纯加装饰。

每个游戏机制都应能回答：

- 它强化了哪种项目管理能力？
- 它是否帮助用户更快发现责任、节点、成果、风险、闭环、留痕问题？
- 它是否让用户更愿意复盘和再次挑战？
- 它是否可由当前结果确定性计算？
- 它是否兼容旧案例？

推荐映射：

| 游戏元素 | 对应训练目标 |
| --- | --- |
| 关卡 | 一次真实项目问题推演 |
| 主线任务 | 当前问题必须达成的管理目标 |
| 支线任务 | 责任、节点、成果、风险、闭环、留痕等补强动作 |
| 隐藏任务 | 模型或规则识别出的潜在风险 |
| 通关评分 | 推进方案完整度和训练质量 |
| XP | 用户累计完成高质量推演的训练量 |
| 等级 | 项目管理训练熟练度 |
| 徽章 | 稳定能力行为，例如善于闭环、善于留痕、善于上报 |
| 再挑战 | 对同一案例重新推演并补强短板 |

## 全局执行协议

给任何模型或平台执行前，先复制以下协议：

```text
你正在 PM Pixel Simulator 项目中执行游戏化小迭代。

优先级：
1. 正确性和最小改动优先。
2. 只做本文指定阶段，不顺手重构其它模块。
3. 尊重已有未提交改动，不回滚用户修改。
4. 不读取、不输出、不提交真实敏感案例正文。
5. 新增能力必须兼容旧历史案例。
6. 游戏化数据优先由现有推演结果确定性计算，不依赖大模型。

执行前必须：
1. 运行 git status --short。
2. 阅读 README.md、docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md。
3. 阅读本阶段涉及的页面、组件、service 和类型文件。
4. 明确本阶段的成功标准。

执行后必须：
1. 运行 npm run typecheck。
2. 运行 npm run build。
3. 如涉及交互，启动本地服务并手动验证关键页面。
4. 汇报修改文件、实现规则、验证结果、未做事项。
```

## 推荐阶段

不要一次做完所有游戏化。推荐按以下顺序，每轮只做一个阶段：

1. 通关结算 MVP。
2. 任务链和支线目标。
3. 成长档案和 XP 汇总。
4. 徽章系统。
5. 再挑战模式。
6. 关卡地图或训练路线。
7. 大模型提示词微调。

前四阶段完成后，产品已经具备明显游戏化体验。第 5 到第 7 阶段再增强复玩和内容稳定性。

---

# 阶段 1：通关结算 MVP

## 目标

每次推演生成后，用户不仅看到角色质疑和方案，还能看到一个“通关结算”区域：

- 本关评分。
- 通关等级。
- 星级。
- 获得 XP。
- 强项。
- 需要补强的短板。
- 下一次挑战建议。

该阶段只做确定性结算，不做持久化、不做账号、不做历史累计。

## 建议新增类型

在 `src/types/simulation.ts` 增加：

```ts
export type ClearanceGrade = "S" | "A" | "B" | "C" | "D";

export interface GameClearance {
  score: number;
  grade: ClearanceGrade;
  stars: number;
  xp: number;
  title: string;
  strengths: string[];
  weaknesses: string[];
  nextChallengeTips: string[];
}
```

如果执行平台判断不需要导出类型，也可以放在新 service 内部。优先保持简单。

## 建议新增文件

新增：

- `src/services/gamificationService.ts`
- `src/components/GameClearancePanel.tsx`

修改：

- `src/components/SimulationResultView.tsx`
- `src/types/simulation.ts`

## 评分规则

在 `gamificationService.ts` 中实现 `buildGameClearance(result)`。

建议公式：

```text
abilityScore = result.abilityScore.total，缺失时 0

gapScore =
  gapScan.items 每项：
  pass = 100
  partial = 60
  fail = 20
  无 items 时 0
  取平均

actionScore =
  所有 todayActions / tomorrowActions / weeklyActions 中，
  owner、action、deadline、output、checker 五个字段填写比例 * 100
  无 action 时 0

assetScore =
  caseAsset 有 caseType + exposedProblems + reusableTemplates + shareableOutputs 时按项加分：
  caseType 20
  exposedProblems 非空 25
  reusableTemplates 非空 25
  shareableOutputs 非空 30

clearanceScore =
  round(abilityScore * 0.4 + gapScore * 0.25 + actionScore * 0.25 + assetScore * 0.1)
```

等级：

```text
S: score >= 90
A: score >= 80
B: score >= 65
C: score >= 50
D: score < 50
```

星级：

```text
3 星：score >= 85 且 gapScan 没有 fail
2 星：score >= 70
1 星：score >= 50
0 星：score < 50
```

XP：

```text
base = max(10, round(score * 1.2))
roleBonus = min(roleResults.length, 6) * 3
actionBonus = 完整行动项数量 * 5
xp = base + roleBonus + actionBonus
```

强项：

- 能力维度分数 >= 85 的维度。
- `gapScan` 中 `pass` 的检查项。
- 最多展示 4 条。

短板：

- 能力维度分数 < 70 的维度。
- `gapScan` 中 `fail` 或 `partial` 的问题。
- 行动项缺少责任人、时间、成果或检查人。
- 最多展示 5 条。

下一次挑战建议：

- 优先根据短板生成。
- 如果没有明显短板，提示“尝试减少角色选择数量后重新挑战，检查方案是否仍完整”或“尝试换一个真实项目问题训练迁移能力”。

## UI 要求

`GameClearancePanel` 放在 `SimulationResultView` 的“关卡生成”之后、“角色对话”之前。

建议视觉：

- 使用 `PixelCard` 包裹。
- 标题：`通关结算`
- eyebrow：`CLEAR`
- 显示大号等级，如 `A级通关`。
- 显示评分、星级、XP。
- 用小标签展示强项和短板。
- 不使用复杂动画，先保证清晰稳定。
- 移动端不能溢出。

## 验收标准

- 新生成推演显示通关结算。
- 历史详情中的旧案例也显示通关结算。
- 缺少 `abilityScore`、`gapScan`、`actionPlan` 或 `caseAsset` 的旧记录不会报错。
- 本地规则和大模型结果都能计算。
- XP、等级、星级刷新后稳定一致。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 1 执行：为 PM Pixel Simulator 增加“通关结算 MVP”。

边界：
1. 只做通关结算，不做 XP 持久化、徽章、再挑战、地图。
2. 使用确定性规则从现有推演结果计算评分、等级、星级、XP。
3. 兼容旧历史案例，缺字段不能报错。
4. 不修改 storage/simulation-records.json。
5. 不重构无关 UI。

需要完成：
1. 新增 gamificationService，提供 buildGameClearance(result)。
2. 新增 GameClearancePanel。
3. 在 SimulationResultView 中展示通关结算。
4. 必要时补充最小类型定义。
5. 运行 npm run typecheck 和 npm run build。

完成后汇报：
1. 修改文件。
2. 评分和 XP 规则。
3. 旧案例兼容方式。
4. 验证结果。
```

---

# 阶段 2：任务链和支线目标

## 目标

把推演结果转成更像游戏任务面板的结构，让用户看到：

- 主线任务：本关必须解决的管理目标。
- 支线任务：责任、节点、成果、风险、闭环、留痕等训练项。
- 隐藏风险任务：由隐藏风险生成的提醒。
- 每项状态：已完成 / 部分完成 / 未完成。

## 建议新增类型

```ts
export type QuestObjectiveType = "main" | "side" | "hidden" | "evidence";
export type QuestObjectiveStatus = "done" | "partial" | "missing";

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  title: string;
  description: string;
  status: QuestObjectiveStatus;
  source: string;
}
```

## 建议新增或修改

修改 `src/services/gamificationService.ts`，增加：

```ts
export function buildQuestObjectives(result: ResultData): QuestObjective[]
```

新增：

- `src/components/QuestObjectivePanel.tsx`

修改：

- `src/components/SimulationResultView.tsx`

## 生成规则

主线任务：

- 来源：`result.mainQuest`
- 状态：
  - score >= 80 时 `done`
  - score >= 60 时 `partial`
  - 其它 `missing`

支线任务：

从 `gapScan.items` 生成，每个检查项一个任务：

```text
pass -> done
partial -> partial
fail -> missing
```

标题使用 `gapScan.items[].label`。

描述：

- pass：使用 `improvementAction`，提示执行时保留证据。
- partial/fail：使用 `problem + improvementAction`。

隐藏风险任务：

- 来源：`hiddenRisks`。
- 状态默认 `partial`。
- 最多展示 4 条。

证据任务：

从 `actionPlan.requiredForms`、`actionPlan.deliverables` 中提取：

- 有明确表单或成果时为 `partial`。
- 如果同时有完整行动项、归档类材料、复核人，则可为 `done`。

## UI 要求

- 面板标题：`任务链`
- eyebrow：`QUESTS`
- 用分组展示主线、支线、隐藏、证据。
- 状态标签：
  - 已完成：绿色。
  - 部分完成：黄色。
  - 未完成：红色。
- 不要把任务写成长段说明，保持可扫描。

## 验收标准

- 推演页和历史详情都能显示任务链。
- 支线任务数量与 `gapScan.items` 对应。
- `pass/partial/fail` 映射正确。
- 缺 `hiddenRisks` 或 `requiredForms` 时页面不报错。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 2 执行：增加“任务链和支线目标”。

边界：
1. 只做任务链展示，不做 XP 汇总、徽章、地图。
2. 任务状态必须从现有 result 确定性计算。
3. 推演页和历史详情复用同一个展示组件。
4. 兼容旧案例缺字段。

需要完成：
1. 在 gamificationService 中新增 buildQuestObjectives。
2. 新增 QuestObjectivePanel。
3. 在 SimulationResultView 中展示。
4. 运行 typecheck/build。

完成后汇报任务映射规则和验证结果。
```

---

# 阶段 3：成长档案和 XP 汇总

## 目标

从历史案例派生用户成长档案，让首页或历史页显示：

- 总 XP。
- 当前等级。
- 已通关关卡数。
- 高质量通关数。
- 最常见短板。
- 下一等级还差多少 XP。

该阶段不新增账号，不新增云存储，不单独持久化 XP。XP 从历史记录实时计算。

## 建议新增类型

```ts
export interface PlayerProgress {
  totalXp: number;
  level: number;
  rankName: string;
  clearedCount: number;
  highQualityClearCount: number;
  nextLevelXp: number;
  xpToNextLevel: number;
  commonWeaknesses: string[];
}
```

## 等级规则

为保持简单，使用固定阈值：

```text
Lv.1: 0
Lv.2: 200
Lv.3: 500
Lv.4: 900
Lv.5: 1400
Lv.6: 2000
Lv.7: 2700
Lv.8: 3500
Lv.9: 4400
Lv.10: 5400
```

超过 Lv.10 后可继续用：

```text
next = 5400 + (level - 9) * 1200
```

称号建议：

```text
Lv.1-2：见习项目官
Lv.3-4：节点推进者
Lv.5-6：闭环指挥员
Lv.7-8：风险预警官
Lv.9+：项目作战参谋
```

## 建议修改

修改 `src/services/gamificationService.ts`：

```ts
export function buildPlayerProgress(records: SimulationRecord[]): PlayerProgress
```

新增：

- `src/components/PlayerProgressPanel.tsx`

修改：

- `src/app/page.tsx` 或 `src/app/history/page.tsx`

优先放在历史页顶部，因为历史页已读取 `records`，实现更小。若放首页，需要首页也读取历史案例。

## 计算规则

- 对每个 record 调用 `buildGameClearance(record)` 得到 XP。
- `totalXp` 为所有 XP 总和。
- `clearedCount` 为历史记录总数。
- `highQualityClearCount` 为 grade 为 `S` 或 `A` 的记录数。
- `commonWeaknesses` 从 `GameClearance.weaknesses` 聚合出现频次，取前 5。

## UI 要求

- 面板标题：`训练档案`
- 展示总 XP、等级、称号、通关数、高质量通关数。
- 展示一个简单进度条：当前等级到下一等级。
- 展示常见短板标签。
- 不做复杂个人资料页。

## 验收标准

- 历史记录为空时显示 Lv.1、0 XP。
- 新保存一个案例后，历史页刷新能看到 XP 增加。
- 删除案例后，XP 会随历史记录重新计算。
- 不写入新的本地存储。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 3 执行：增加“成长档案和 XP 汇总”。

边界：
1. XP 从历史案例派生，不新增账号、不新增云端、不新增单独存储。
2. 优先在历史页顶部展示，避免首页额外读取带来复杂度。
3. 删除或新增案例后，XP 应由 records 自动重新计算。

需要完成：
1. 在 gamificationService 中新增 buildPlayerProgress。
2. 新增 PlayerProgressPanel。
3. 在历史页接入。
4. 验证空历史、已有历史、删除案例三种情况。
5. 运行 typecheck/build。
```

---

# 阶段 4：徽章系统

## 目标

增加确定性徽章，鼓励用户形成项目管理好习惯。

徽章先从历史案例实时派生，不做手动领取，不做弹窗轰炸，不做持久化。

## 建议新增类型

```ts
export interface PlayerBadge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
}
```

## 推荐徽章

| id | 名称 | 解锁规则 |
| --- | --- | --- |
| first_clear | 首次通关 | 至少 1 个历史案例 |
| three_clear | 三关训练 | 至少 3 个历史案例 |
| s_rank_clear | S 级通关 | 至少 1 个 S 级案例 |
| closure_keeper | 闭环守门人 | 至少 3 个案例的闭环能力 >= 80 |
| evidence_guardian | 留痕守卫 | 至少 3 个案例的证据意识 >= 80 |
| risk_scout | 风险侦察员 | 至少 3 个案例的风险识别 >= 80 |
| multi_role_thinker | 多角色思考者 | 至少 5 个案例选择或生成 >= 4 个角色 |
| work_output_maker | 工作材料生成者 | 至少 3 个案例有可复制工作材料 |
| trainer_ready | 培训案例准备者 | 至少 1 个 approved 且高培训价值案例 |
| comeback_clear | 复盘改进者 | 再挑战模式完成后再实现，阶段 4 可先保留 locked |

## 建议修改

修改 `src/services/gamificationService.ts`：

```ts
export function buildPlayerBadges(records: SimulationRecord[]): PlayerBadge[]
```

新增：

- `src/components/PlayerBadgePanel.tsx`

修改：

- `src/app/history/page.tsx`

## UI 要求

- 放在训练档案旁边或下方。
- 已解锁徽章用高亮边框。
- 未解锁徽章显示进度，例如 `2 / 3`。
- 不要占用过多屏幕，默认网格展示即可。

## 验收标准

- 空历史时所有徽章为未解锁，进度为 0。
- 满足条件的徽章能稳定解锁。
- 删除案例后徽章状态随 records 重新计算。
- 不写入额外存储。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 4 执行：增加确定性徽章系统。

边界：
1. 徽章从历史案例实时派生，不持久化。
2. 不做弹窗、不做领取流程。
3. 优先在历史页展示。
4. 兼容旧案例缺字段。

需要完成：
1. 在 gamificationService 中新增 buildPlayerBadges。
2. 新增 PlayerBadgePanel。
3. 在历史页展示徽章。
4. 验证空历史、满足条件、不满足条件、删除案例。
5. 运行 typecheck/build。
```

---

# 阶段 5：再挑战模式

## 目标

让用户能从历史详情中点击“重新挑战本关”，带着原始输入回到 `/simulate`，重新选择角色或生成推演。

本阶段先做入口和上下文复用，不做复杂对比报告。

## 建议修改

涉及文件：

- `src/app/history/[id]/page.tsx`
- `src/services/storageService.ts`
- `src/app/simulate/page.tsx`

已有 `saveCurrentInput(input)` 和 `getCurrentInput()` 可复用。优先不新增 API。

## 实现建议

在历史详情页增加按钮：

```text
重新挑战本关
```

点击后：

1. 复制 `record.input`。
2. 生成新的 `id`。
3. 更新 `createdAt`。
4. 可选追加训练目标：`重新挑战：补强上次短板`。
5. 调用 `saveCurrentInput(nextInput)`。
6. 跳转到 `/simulate?mode=retry&fromRecord=<record.id>`。

`simulate/page.tsx` 可读取 query 参数显示一个轻量提示：

```text
再挑战模式：本关来自历史案例，请尝试补强上次短板。
```

如果能从上一条记录计算 `GameClearance.weaknesses`，可以展示最多 3 条挑战提示。

## 注意

- 不要覆盖原历史案例。
- 不要把新推演自动保存为历史，仍由用户点击“保存案例”。
- 不要要求必须使用相同角色，允许用户重新选择。
- 不要把真实项目写回外部系统。

## 验收标准

- 历史详情页可点击重新挑战。
- 进入 `/simulate` 后保留原项目名称、问题、原方案、快照上下文。
- 新输入有新的 id 和 createdAt。
- 生成推演后保存，不会覆盖旧记录。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 5 执行：增加“重新挑战本关”。

边界：
1. 只做历史详情到 simulate 的再挑战入口。
2. 不做复杂前后评分对比。
3. 不覆盖原历史案例。
4. 不自动保存新推演。

需要完成：
1. 历史详情页增加重新挑战按钮。
2. 复用 saveCurrentInput 写入新的 ScenarioInput。
3. 跳转到 /simulate?mode=retry&fromRecord=...
4. simulate 页展示再挑战提示和最多 3 条短板建议。
5. 运行 typecheck/build。
```

---

# 阶段 6：关卡地图或训练路线

## 目标

在不做复杂地图移动的前提下，给用户一个“训练路线”视图，让他们看到项目管理能力的练习路径。

优先做阶段化路线卡片，而不是游戏地图引擎。

## 推荐路线

| 路线节点 | 对应项目阶段 | 训练重点 |
| --- | --- | --- |
| 前期策划站 | planning | 目标、责任、总控 |
| 可研关卡 | feasibility | 外部意见、附件、节点 |
| 设计闭环站 | scheme_design / preliminary_design / construction_drawing | 成果、版本、复核 |
| 招采协同站 | procurement | 边界、条件、材料 |
| 施工偏差站 | construction | 现场节点、风险预警 |
| 验收归档站 | acceptance | 留痕、资料、销项 |
| 结算收口站 | settlement | 证据链、责任闭合 |

## 建议修改

新增：

- `src/components/TrainingRoutePanel.tsx`

修改：

- `src/app/history/page.tsx` 或首页

## 计算规则

从历史 records 按 `input.projectStage` 汇总：

- 每个阶段完成案例数。
- 最高通关等级。
- 平均分。
- 常见短板。

## UI 要求

- 用横向或响应式网格展示路线节点。
- 每个节点是一个小关卡卡片。
- 显示完成数、最高等级、训练重点。
- 未完成阶段显示“未挑战”。
- 不要做可拖动地图或复杂动画。

## 验收标准

- 有历史时能按阶段聚合。
- 无历史时显示完整路线和未挑战状态。
- 移动端不溢出。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 6 执行：增加“训练路线”。

边界：
1. 做路线卡片，不做复杂地图移动。
2. 数据从历史案例 records 派生。
3. 不引入新依赖。
4. 兼容空历史。

需要完成：
1. 新增 TrainingRoutePanel。
2. 在历史页或首页展示训练路线。
3. 按 projectStage 聚合完成数、最高等级、平均分、短板。
4. 运行 typecheck/build。
```

---

# 阶段 7：大模型提示词微调

## 目标

在游戏化 UI 稳定后，微调提示词，让新生成案例更适合任务链和结算反馈。但 XP、等级、徽章仍由本地代码计算。

## 修改文件

- `src/services/promptTemplate.ts`
- 必要时修改 API 解析兜底逻辑。

## 提示词要求

可以要求大模型更稳定地产生：

- 更像关卡的 `levelName`。
- 更明确的 `mainQuest`。
- 更可执行的 `hiddenRisks`。
- 更具体的 `gapScan.items[].improvementAction`。
- 更完整的行动方案。

不要要求大模型输出：

- XP。
- 等级。
- 星级。
- 徽章。
- 用户等级。

这些由本地确定性规则计算。

## 验收标准

- 新生成结果更适合通关结算和任务链展示。
- 大模型缺字段时仍由本地兜底，不崩溃。
- 本地规则推演仍可用。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 可直接复制的执行提示词

```text
请按 docs/GAMIFICATION_ITERATION_INSTRUCTIONS.md 的阶段 7 执行：微调大模型提示词以适配游戏化展示。

边界：
1. 不让大模型输出 XP、等级、星级、徽章。
2. 只强化 levelName、mainQuest、hiddenRisks、gapScan、actionPlan 的结构质量。
3. 保持 JSON 输出结构兼容。
4. 本地规则推演必须仍可用。

需要完成：
1. 更新 promptTemplate。
2. 检查解析和兜底逻辑。
3. 用本地规则和大模型关闭场景验证。
4. 运行 typecheck/build。
```

---

# 验证清单

每个阶段完成后至少执行：

```bash
npm run typecheck
npm run build
```

如涉及页面交互，启动：

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

手动验证页面：

- `/`
- `/simulate`
- `/history`
- `/history/[id]`

重点验证：

- 空历史。
- 旧历史案例。
- 新生成但未保存的结果。
- 新保存后的历史案例。
- 本地规则推演。
- 大模型接口关闭或失败时的兜底。
- 移动端窄屏不溢出。

## 完成报告模板

执行者完成后按以下格式汇报：

```text
已完成阶段：阶段 X - 名称

修改文件：
- ...

核心规则：
- ...

兼容处理：
- ...

验证：
- npm run typecheck：通过 / 未通过，原因
- npm run build：通过 / 未通过，原因
- 手动页面验证：通过 / 未执行，原因

未做事项：
- ...

建议下一阶段：
- ...
```

## Git 注意事项

执行前：

```bash
git status --short
```

不要提交：

- `.env.local`
- `storage/simulation-records.json`
- `node_modules/`
- `.next/`
- `*.log`
- `tsconfig.tsbuildinfo`

如果工作区已有与本阶段无关的改动，不要回滚。只修改与当前阶段直接相关的文件。

## 成功标准

当阶段 1 到阶段 4 完成时，PM Pixel Simulator 应达到：

- 用户每次推演都有清晰的通关反馈。
- 用户知道自己获得多少 XP、当前等级和下一步训练目标。
- 用户能看到自己的常见能力短板。
- 用户能通过徽章理解哪些项目管理行为值得强化。
- 所有游戏化结果可复现、可解释、可由历史案例重新计算。
- 旧案例不丢失、不迁移也能展示。

这就是本轮游戏化的完成边界。后续再考虑更强的关卡地图、挑战对比、训练周报或跨系统联动。
