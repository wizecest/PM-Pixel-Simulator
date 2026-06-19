"use client";

import { Database, History, Play, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import {
  databaseProjectToScenarioInput,
  parseProjectDatabase,
  parseProjectIssueSnapshot,
  snapshotToScenarioInput,
} from "@/services/snapshotBridge";
import { saveCurrentInput } from "@/services/storageService";
import type { ProjectDatabaseProject, ProjectStage, ScenarioInput } from "@/types/simulation";

const stageOptions: { value: ProjectStage; label: string }[] = [
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

const trainingGoalOptions = ["全局视野", "节点控制", "责任判断", "协同推进", "闭环能力", "风险识别", "证据意识", "复盘沉淀"];

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
}

export function ScenarioForm() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [projectStage, setProjectStage] = useState<ProjectStage>("feasibility");
  const [currentProblem, setCurrentProblem] = useState("");
  const [involvedParties, setInvolvedParties] = useState("");
  const [proposedAction, setProposedAction] = useState("");
  const [trainingGoals, setTrainingGoals] = useState<string[]>(["节点控制", "闭环能力", "证据意识"]);
  const [databaseProjects, setDatabaseProjects] = useState<ProjectDatabaseProject[]>([]);
  const [selectedDatabaseProjectId, setSelectedDatabaseProjectId] = useState("");
  const [databaseFileName, setDatabaseFileName] = useState("");
  const [error, setError] = useState("");

  function toggleTrainingGoal(goal: string) {
    setTrainingGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectName.trim() || !currentProblem.trim() || !proposedAction.trim()) {
      setError("请补充项目名称、当前问题和我的推进方案。");
      return;
    }

    const input: ScenarioInput = {
      id: createId(),
      projectName: projectName.trim(),
      projectStage,
      currentProblem: currentProblem.trim(),
      involvedParties: involvedParties.trim() || undefined,
      proposedAction: proposedAction.trim(),
      trainingGoals,
      createdAt: new Date().toISOString(),
    };

    try {
      saveCurrentInput(input);
      router.push("/simulate");
    } catch {
      setError("当前浏览器无法写入本地存储，请检查浏览器设置后重试。");
    }
  }

  async function handleSnapshotImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      let parsed: unknown;

      try {
        parsed = JSON.parse(content) as unknown;
      } catch {
        throw new Error("文件不是有效 JSON。");
      }

      const snapshot = parseProjectIssueSnapshot(parsed);
      saveCurrentInput(snapshotToScenarioInput(snapshot));
      router.push("/simulate");
    } catch (cause) {
      setError(cause instanceof Error ? `快照导入失败：${cause.message}` : "快照导入失败。");
    }
  }

  async function handleDatabaseImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      let parsed: unknown;

      try {
        parsed = JSON.parse(content) as unknown;
      } catch {
        throw new Error("文件不是有效 JSON。");
      }

      const database = parseProjectDatabase(parsed);
      if (database.projects.length === 0) {
        throw new Error("项目数据库为空。");
      }

      setDatabaseProjects(database.projects);
      setSelectedDatabaseProjectId(database.projects[0].project_id);
      setDatabaseFileName(file.name);
      setError("");
    } catch (cause) {
      setDatabaseProjects([]);
      setSelectedDatabaseProjectId("");
      setDatabaseFileName("");
      setError(cause instanceof Error ? `项目数据库导入失败：${cause.message}` : "项目数据库导入失败。");
    }
  }

  function handleDatabaseProjectStart() {
    const project = databaseProjects.find((item) => item.project_id === selectedDatabaseProjectId);
    if (!project) {
      setError("请先选择一个数据库项目。");
      return;
    }

    try {
      saveCurrentInput(databaseProjectToScenarioInput(project));
      router.push("/simulate");
    } catch {
      setError("当前浏览器无法写入本地存储，请检查浏览器设置后重试。");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="field-label">项目名称</span>
        <input
          className="pixel-input"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="小石嘴片区旅游基础配套项目"
        />
      </label>

      <label className="grid gap-2">
        <span className="field-label">项目阶段</span>
        <select
          className="pixel-input"
          value={projectStage}
          onChange={(event) => setProjectStage(event.target.value as ProjectStage)}
        >
          {stageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="field-label">当前问题</span>
        <textarea
          className="pixel-input min-h-28"
          value={currentProblem}
          onChange={(event) => setCurrentProblem(event.target.value)}
          placeholder="财局提出修改意见后，设计单位迟迟未提交正式修改稿。"
        />
      </label>

      <label className="grid gap-2">
        <span className="field-label">涉及单位 / 人员</span>
        <textarea
          className="pixel-input min-h-20"
          value={involvedParties}
          onChange={(event) => setInvolvedParties(event.target.value)}
          placeholder="项目负责人、设计管理人员、前期部、设计单位、财局"
        />
      </label>

      <label className="grid gap-2">
        <span className="field-label">我的推进方案</span>
        <textarea
          className="pixel-input min-h-24"
          value={proposedAction}
          onChange={(event) => setProposedAction(event.target.value)}
          placeholder="明天通知设计单位尽快提交修改稿。"
        />
      </label>

      <fieldset className="grid gap-2">
        <legend className="field-label">期望训练能力</legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {trainingGoalOptions.map((goal) => (
            <label key={goal} className="pixel-check">
              <input
                type="checkbox"
                checked={trainingGoals.includes(goal)}
                onChange={() => toggleTrainingGoal(goal)}
              />
              <span>{goal}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="border-2 border-pixel-red bg-[#2a171a] px-3 py-2 text-sm text-pixel-red">{error}</p>}

      {databaseProjects.length > 0 && (
        <div className="grid gap-3 border-2 border-pixel-border bg-[#101822] p-3 shadow-pixelSm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-pixel-yellow">项目数据库：{databaseFileName}</p>
            <span className="text-xs text-pixel-muted">{databaseProjects.length} 个项目</span>
          </div>
          <label className="grid gap-2">
            <span className="field-label">选择真实项目</span>
            <select
              className="pixel-input"
              value={selectedDatabaseProjectId}
              onChange={(event) => setSelectedDatabaseProjectId(event.target.value)}
            >
              {databaseProjects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}｜{project.current_state.current_node || "未标注节点"}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <PixelButton type="button" variant="secondary" icon={<Play size={18} />} onClick={handleDatabaseProjectStart}>
              用该项目开始模拟
            </PixelButton>
            <p className="text-xs text-pixel-muted">仅读取数据库中的 simulator_snapshot，不写回 pm-obsidian。</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <PixelButton type="submit" icon={<Play size={18} />}>
          开始模拟
        </PixelButton>
        <label className="pixel-link-button cursor-pointer">
          <Upload size={18} />
          导入项目快照
          <input className="sr-only" type="file" accept=".json,application/json" onChange={handleSnapshotImport} />
        </label>
        <label className="pixel-link-button cursor-pointer">
          <Database size={18} />
          导入项目数据库
          <input className="sr-only" type="file" accept=".json,application/json" onChange={handleDatabaseImport} />
        </label>
        <Link className="pixel-link-button" href="/history">
          <History size={18} />
          查看历史案例
        </Link>
      </div>
    </form>
  );
}
