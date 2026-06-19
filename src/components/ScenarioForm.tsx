"use client";

import { History, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { saveCurrentInput } from "@/services/storageService";
import type { ProjectStage, ScenarioInput } from "@/types/simulation";

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

      <div className="flex flex-wrap gap-3">
        <PixelButton type="submit" icon={<Play size={18} />}>
          开始模拟
        </PixelButton>
        <Link className="pixel-link-button" href="/history">
          <History size={18} />
          查看历史案例
        </Link>
      </div>
    </form>
  );
}
