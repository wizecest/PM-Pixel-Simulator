"use client";

import { ArrowLeft, Download, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import rolesData from "@/data/roles.json";
import scenesData from "@/data/scenes.json";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { RoleSelector } from "@/components/RoleSelector";
import { SceneSelector } from "@/components/SceneSelector";
import { SimulationResultView } from "@/components/SimulationResultView";
import { buildDecisionFlightRecord } from "@/services/decisionFlightRecordService";
import { downloadActionPack } from "@/services/exportService";
import { generateSimulation } from "@/services/simulationService";
import { getCurrentInput, saveRecord } from "@/services/storageService";
import type { GenerateSimulationResponse, Role, Scene, ScenarioInput, SimulationRecord } from "@/types/simulation";

const roles = rolesData as Role[];
const scenes = scenesData as Scene[];

function getRecommendedScene(input: ScenarioInput) {
  return scenes.find((scene) => scene.suitableStages.includes(input.projectStage)) ?? scenes[0];
}

function getRecommendedRoleIds(scene: Scene) {
  const roleIds = [...scene.recommendedRoles];
  for (const role of roles) {
    if (roleIds.length >= 5) {
      break;
    }
    if (!roleIds.includes(role.id)) {
      roleIds.push(role.id);
    }
  }
  return roleIds;
}

function createRecord(input: ScenarioInput, selectedSceneId: string, selectedRoleIds: string[], result: GenerateSimulationResponse): SimulationRecord {
  const record: SimulationRecord = {
    id: input.id,
    input,
    selectedSceneId,
    selectedRoleIds,
    simulationSource: result.simulationSource,
    levelName: result.levelName,
    riskLevel: result.riskLevel,
    mainQuest: result.mainQuest,
    hiddenRisks: result.hiddenRisks,
    roleResults: result.roleResults,
    gapScan: result.gapScan,
    abilityScore: result.abilityScore,
    actionPlan: result.actionPlan,
    caseAsset: result.caseAsset,
    createdAt: new Date().toISOString(),
  };

  return {
    ...record,
    flightRecord: buildDecisionFlightRecord(record),
  };
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-pixel-cyan">{title}：</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-pixel-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SnapshotSummary({ input }: { input: ScenarioInput }) {
  const snapshot = input.sourceSnapshot;
  if (!snapshot) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3 border-t-2 border-pixel-border pt-4 text-sm">
      <p>
        <span className="text-pixel-cyan">当前节点：</span>
        {snapshot.currentNode || "未填写"}
      </p>
      <p>
        <span className="text-pixel-cyan">节点状态：</span>
        {snapshot.nodeStatus || "未填写"}
      </p>
      <p>
        <span className="text-pixel-cyan">风险：</span>
        {snapshot.riskNote || "未填写"}
      </p>
      <ListBlock title="最近事件" items={snapshot.latestEvents} />
      <ListBlock title="待办动作" items={snapshot.pendingActions} />
      <p>
        <span className="text-pixel-cyan">用户问题：</span>
        {snapshot.userQuestion || "未填写"}
      </p>
    </div>
  );
}

export default function SimulatePage() {
  const [input, setInput] = useState<ScenarioInput>();
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [result, setResult] = useState<GenerateSimulationResponse>();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentInput = getCurrentInput();
    setInput(currentInput);
    if (currentInput) {
      const scene = getRecommendedScene(currentInput);
      setSelectedSceneId(scene.id);
      setSelectedRoleIds(getRecommendedRoleIds(scene));
    }
  }, []);

  const selectedScene = useMemo(() => scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0], [selectedSceneId]);
  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [selectedRoleIds],
  );

  async function handleGenerate() {
    if (!input) {
      setError("未找到本次模拟输入，请返回首页重新填写。");
      return;
    }

    if (selectedRoleIds.length < 3) {
      setError("至少选择 3 个角色。");
      return;
    }

    setError("");
    setSaved(false);
    setLoading(true);

    try {
      const nextResult = await generateSimulation({
        input,
        selectedScene,
        selectedRoles,
      });
      setResult(nextResult);
    } catch (cause) {
      console.error(cause);
      setError("推演生成失败，请重试。");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!input || !result) {
      return;
    }

    try {
      await saveRecord(createRecord(input, selectedSceneId, selectedRoleIds, result));
      setSaved(true);
    } catch {
      setError("保存失败，无法写入本地案例库文件。");
    }
  }

  return (
    <PixelLayout>
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-pixel-cyan hover:text-pixel-yellow">
          <ArrowLeft size={16} />
          返回首页
        </Link>
      </div>

      {!input ? (
        <PixelCard title="未找到输入" eyebrow="EMPTY">
          <p className="text-pixel-muted">请返回首页创建一次模拟。</p>
        </PixelCard>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div className="grid gap-6">
              <PixelCard title="项目问题" eyebrow="INPUT">
                <div className="grid gap-3 text-sm">
                  <p>
                    <span className="text-pixel-cyan">项目：</span>
                    {input.projectName}
                  </p>
                  <p>
                    <span className="text-pixel-cyan">问题：</span>
                    {input.currentProblem}
                  </p>
                  <p>
                    <span className="text-pixel-cyan">方案：</span>
                    {input.proposedAction}
                  </p>
                  <SnapshotSummary input={input} />
                </div>
              </PixelCard>

              <PixelCard title="场景选择" eyebrow="SCENE">
                <SceneSelector scenes={scenes} selectedSceneId={selectedSceneId} onSelect={setSelectedSceneId} />
              </PixelCard>
            </div>

            <PixelCard title="角色选择" eyebrow="ROLES">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm text-pixel-muted">
                <span>已选择 {selectedRoleIds.length} 个角色</span>
                <span>最低 3 个</span>
              </div>
              <RoleSelector roles={roles} selectedRoleIds={selectedRoleIds} onChange={setSelectedRoleIds} />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <PixelButton type="button" onClick={handleGenerate} disabled={loading} icon={<Sparkles size={18} />}>
                  {loading ? "生成中" : "生成推演"}
                </PixelButton>
                {result && (
                  <PixelButton type="button" variant="secondary" onClick={handleSave} icon={<Save size={18} />}>
                    保存案例
                  </PixelButton>
                )}
                {result && input && (
                  <PixelButton
                    type="button"
                    variant="secondary"
                    onClick={() => downloadActionPack(input, result)}
                    icon={<Download size={18} />}
                  >
                    导出建议包 JSON
                  </PixelButton>
                )}
                {saved && <span className="text-sm font-bold text-pixel-green">已保存</span>}
              </div>
              {error && <p className="mt-4 border-2 border-pixel-red bg-[#2a171a] px-3 py-2 text-sm text-pixel-red">{error}</p>}
            </PixelCard>
          </div>

          {result && <SimulationResultView result={result} />}
        </div>
      )}
    </PixelLayout>
  );
}
