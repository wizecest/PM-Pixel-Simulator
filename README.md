# PM Pixel Simulator

> 第一次使用三系统联动，请先看：[`三系统统一工作流使用手册.md`](/E:/pm-obsidian/00_系统/三系统统一工作流使用手册.md)


PM Pixel Simulator 是一个像素风格的工程项目管理角色模拟器。

它用于把真实项目管理问题转成一次“项目关卡”，让用户从总经理、项目负责人、设计管理、前期报批、资料档案、服务单位等角色视角审视推进方案，并生成管理漏洞扫描、能力评分、通关方案和案例沉淀内容。

## 当前版本

```text
v0.1.0 - MVP 跑通版
```

当前版本重点验证核心训练闭环：

```text
输入真实问题
→ 选择场景和角色
→ 生成多角色质疑
→ 扫描管理漏洞
→ 输出能力评分
→ 生成通关方案
→ 保存历史案例
→ 导出单个案例素材
```

## v0.2.0 方向：决策飞行记录仪

PM Pixel 的管理闭环从：

```text
输入真实问题 → 选择场景和角色 → 生成多角色质疑 → 扫描管理漏洞 → 输出能力评分 → 生成通关方案 → 保存历史案例
```

升级为：

```text
输入问题 → AI 推演 → 人工采纳 → 真实执行 → 现实反馈 → 判断升级 → 案例资产
```

决策飞行记录仪用于把一次推演转化为可复盘的人工管理决策记录。它不是项目真实状态源，也不会自动写回 `pm-obsidian`、同步飞书或替代人工执行记录。

只有补充过真实执行、现实反馈和判断升级的案例，才建议在人工脱敏和复核后进入 Agent Success Cases 或培训素材库。

## 与 E:\pm-obsidian 的只读数据衔接

`E:\pm-obsidian` 仍然是唯一真实项目状态源。PM Pixel Simulator 只读取本地 JSON 数据库或单项目快照，不直接修改项目主页、项目日志、control-plane 或工作日志，也不做 Obsidian / 飞书同步。
### 推荐：从 Nexus 一键进入

当 Nexus 服务和 PM Pixel 开发服务同时运行时，可以不用手工选择 JSON：

1. 在 `E:\pm-obsidian` 启动或刷新 Nexus，`export_project_dashboard.py` 会同步更新 PM Pixel 全量项目数据库；
2. 打开 Nexus 单项目作战页，点击 `沙盘推演`；
3. 浏览器跳转到 `http://127.0.0.1:3000/from-project?...`；
4. PM Pixel 按项目 id/key/name 读取最新数据库，保存为当前推演输入并进入 `/simulate`；
5. 推演完成后导出 `pm-pixel-action-pack/v1`，人工确认后再回工程项目管理 AI 系统执行。

默认数据库路径：

```text
E:\pm-obsidian\工作输出\04-工具模板\pm-pixel-database\pm-pixel-project-database.json
```

如需改路径，在启动 PM Pixel 前设置：

```powershell
$env:PM_PIXEL_PROJECT_DATABASE_PATH = "E:\pm-obsidian\工作输出\04-工具模板\pm-pixel-database\pm-pixel-project-database.json"
```

### 全量项目数据库

推荐使用全量项目数据库，而不是逐个项目手工导入。

数据库路径：

```text
E:\pm-obsidian\工作输出\04-工具模板\pm-pixel-database\pm-pixel-project-database.json
```

生成命令（推荐通过 Nexus 刷新）：

```powershell
cd E:\pm-obsidian
python scripts\python\export_project_dashboard.py
```

只需要单独刷新模拟器数据库时，也可以运行：

```powershell
cd E:\pm-obsidian
python scripts\python\export_pm_pixel_database.py
```

数据库 schema：

```json
{
  "source": "pm-obsidian",
  "schema_version": "pm-pixel-project-database/v1",
  "generated_at": "",
  "state_policy": {},
  "source_layers": [],
  "project_count": 0,
  "projects": []
}
```

每个项目内包含一个 `simulator_snapshot`，兼容下方单项目快照格式。

手工导入流程（备用）：

1. 在 `E:\pm-obsidian` 生成 `pm-pixel-project-database.json`；
2. 在模拟器首页点击“导入项目数据库”；
3. 选择上述 JSON 文件；
4. 在页面中选择真实项目；
5. 点击“用该项目开始模拟”；
6. 生成推演后导出建议包 JSON。

当前数据库读取的数据层：

- control-plane：`graph.yaml`、`derived-state.yaml`、`events/*.yaml`；
- 项目主页：项目元数据、项目概览、项目时间线；
- 项目日志：近期项目流水。

这些内容作为模拟器的只读上下文，不会被模拟器改写。

### 单项目快照

快照格式约定：

```json
{
  "source": "pm-obsidian",
  "schema_version": "pm-pixel-snapshot/v1",
  "generated_at": "YYYY-MM-DDTHH:mm:ss+08:00",
  "project_id": "",
  "project_name": "",
  "current_node": "",
  "node_status": "",
  "risk_note": "",
  "latest_events": [],
  "pending_actions": [],
  "evidence_links": [],
  "user_question": ""
}
```

使用流程：

1. 从 `E:\pm-obsidian` 生成或另存一个符合上述格式的项目问题快照 JSON；
2. 在首页点击“导入项目快照”，选择本地 JSON 文件；
3. 进入推演页后，页面会显示项目名称、当前节点、节点状态、风险、最近事件、待办动作和用户问题；
4. 点击“生成推演”；
5. 点击“导出建议包 JSON”，得到 `pm-pixel-action-pack/v1` 建议包；
6. 建议包只作为人工确认材料，需要人工判断后再回到工程项目管理 AI 系统执行。

仓库内提供脱敏样例：

```text
samples/pm-pixel-snapshot.sample.json
```

建议包格式：

```json
{
  "source": "pm-pixel-simulator",
  "schema_version": "pm-pixel-action-pack/v1",
  "project_id": "",
  "project_name": "",
  "management_gaps": [],
  "role_challenges": [],
  "recommended_actions": [],
  "owner_suggestions": [],
  "deadline_suggestions": [],
  "evidence_needed": [],
  "writeback_candidates": []
}
```

注意：`storage/simulation-records.json` 是模拟器历史案例库，不是项目真实状态源。导出建议包不会自动写回 `E:\pm-obsidian`。

## 启动方式

### 方式一：双击启动

在 Windows 上直接双击：

```text
start-game.bat
```

脚本会自动执行：

1. 检查 Node.js 和 npm；
2. 首次运行时安装依赖；
3. 清理旧缓存；
4. 启动本地服务；
5. 打开浏览器。

浏览器地址：

```text
http://127.0.0.1:3000
```

启动后请保持命令行窗口打开，关闭窗口会停止游戏。

### 方式二：命令行启动

```powershell
npm install
npm run dev
```

然后打开：

```text
http://127.0.0.1:3000
```

## 环境要求

需要先安装：

```text
Node.js
npm
```

如果双击启动提示没有 Node.js，请先安装：

```text
https://nodejs.org/
```

## 大模型配置

项目支持 OpenAI-Compatible 接口。

复制 `.env.example` 为 `.env.local`，然后填写自己的模型配置：

```env
LLM_PROVIDER=openai-compatible
LLM_API_KEY=YOUR_API_KEY_HERE
LLM_MODEL=YOUR_MODEL_NAME
LLM_BASE_URL=https://your-compatible-endpoint.example.com/v1
NEXT_PUBLIC_PM_PIXEL_LIVE_LLM=true
```

说明：

- `LLM_API_KEY`：你的模型 API Key；
- `LLM_MODEL`：模型名称；
- `LLM_BASE_URL`：兼容 OpenAI Chat Completions 的接口地址，通常以 `/v1` 结尾；
- `NEXT_PUBLIC_PM_PIXEL_LIVE_LLM=true`：开启真实大模型推演。

不要把 `.env.local` 发给别人，也不要上传到 Git 仓库。

## 如何判断推演来源

生成推演后，“关卡生成”区域会显示：

```text
推演来源：大模型接口
```

或：

```text
推演来源：本地规则
```

如果开启大模型但接口失败，页面会提示“推演生成失败”，不会静默切回本地规则。

## 历史案例保存位置

历史案例保存到本地文件：

```text
storage/simulation-records.json
```

这个文件是长期案例库。

注意：

- 点击“保存案例”会写入这个文件；
- 换浏览器不影响历史案例；
- 发给别人试用时，不建议附带自己的真实案例库；
- 真实案例可能包含项目名称、单位名称、内部责任口径等敏感信息。

当前 Git 配置会忽略：

```text
storage/*.json
.env.local
```

因此真实案例库和 API Key 默认不会提交。

## 单个案例导出

历史案例详情页提供：

```text
导出 Markdown
```

用途：

- 分享某个案例；
- 作为培训素材；
- 放入 Obsidian、文档库或项目复盘材料；
- 进行脱敏后二次整理。

导出和保存历史案例是两个不同动作：

- 保存案例：写入长期案例库；
- 导出 Markdown：导出当前打开的单个案例。

## 建议试用流程

建议先用 3-5 个真实项目问题测试：

1. 可研修改滞后；
2. 报批附件缺失；
3. 设计成果反复修改；
4. 施工现场节点偏差；
5. 资料归档缺口。

每个问题重点观察：

- 角色质疑是否有明显差异；
- 总经理视角是否关注责任、机制和结果；
- 项目负责人视角是否关注节点、协同和闭环；
- 设计管理视角是否关注修改清单、成果质量和版本；
- 前期报批视角是否关注路径、附件和审批口径；
- 资料档案视角是否关注证据链和归档；
- 通关方案是否明确到人、事、时间、成果和检查人。

## 版本管理

本项目已初始化 Git。

当前版本标签：

```text
v0.1.0
```

常用命令：

```powershell
git status
git add .
git commit -m "feat: 描述本次修改"
git tag v0.1.1
```

建议版本节奏：

```text
v0.1.x - 修复和可用性打磨
v0.2.0 - 案例库管理增强
v0.3.0 - 多模型配置和推演质量调校
v1.0.0 - 可稳定交给他人试用
```

## 不要提交或外发的内容

以下内容不要提交到远程仓库，也不要发给外部人员：

```text
.env.local
storage/simulation-records.json
node_modules/
.next/
next-dev.out.log
next-dev.err.log
```

## 常见问题

### 页面 404 或 500

优先关闭当前命令行窗口，然后重新双击：

```text
start-game.bat
```

启动脚本会自动清理 `.next` 缓存并重启服务。

### 3000 端口被占用

如果 3000 端口被其它程序占用，启动脚本会提示。

先关闭占用 3000 端口的程序，再重新启动。

### 生成推演失败

检查 `.env.local`：

```env
LLM_PROVIDER=openai-compatible
LLM_API_KEY=...
LLM_MODEL=...
LLM_BASE_URL=...
NEXT_PUBLIC_PM_PIXEL_LIVE_LLM=true
```

如果暂时不想用大模型，可以把：

```env
NEXT_PUBLIC_PM_PIXEL_LIVE_LLM=false
```

然后重启服务，系统会使用本地规则推演。

## 当前边界

MVP 暂不包含：

- 用户登录；
- 云端数据库；
- 多人协作；
- 复杂地图移动；
- 战斗系统；
- 成就系统；
- 文件上传；
- Obsidian / 飞书同步。

当前重点是把“真实项目问题 → 多角色质疑 → 漏洞扫描 → 通关方案 → 案例沉淀”的训练闭环跑稳。
