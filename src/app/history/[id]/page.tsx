"use client";

import { ArrowLeft, Download, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { CaseQualityPanel } from "@/components/CaseQualityPanel";
import { SimulationResultView } from "@/components/SimulationResultView";
import { auditCaseQuality } from "@/services/caseQualityService";
import {
  decisionFlightStatusLabels,
  ensureDecisionFlightRecord,
  getDecisionFlightProgress,
  updateDecisionFlightStep,
} from "@/services/decisionFlightRecordService";
import { downloadActionPack, downloadRecordMarkdown } from "@/services/exportService";
import { getRecordById, saveRecord } from "@/services/storageService";
import type {
  DecisionFlightRecord,
  DecisionFlightStepKey,
  DecisionFlightStepStatus,
  SimulationRecord,
} from "@/types/simulation";

const flightStatusOptions: { value: DecisionFlightStepStatus; label: string }[] = [
  { value: "pending", label: decisionFlightStatusLabels.pending },
  { value: "in_progress", label: decisionFlightStatusLabels.in_progress },
  { value: "completed", label: decisionFlightStatusLabels.completed },
];

function evidenceToText(evidence: string[]) {
  return evidence.join("\n");
}

function textToEvidence(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<SimulationRecord>();
  const [flightRecordDraft, setFlightRecordDraft] = useState<DecisionFlightRecord>();
  const [flightRecordSaved, setFlightRecordSaved] = useState(false);
  const [flightRecordError, setFlightRecordError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setFlightRecordSaved(false);
    setFlightRecordError("");
    getRecordById(params.id)
      .then((nextRecord) => {
        setRecord(nextRecord);
        setFlightRecordDraft(nextRecord ? ensureDecisionFlightRecord(nextRecord) : undefined);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const recordWithFlightRecord = record && flightRecordDraft ? { ...record, flightRecord: flightRecordDraft } : undefined;
  const flightProgress = recordWithFlightRecord ? getDecisionFlightProgress(recordWithFlightRecord) : undefined;

  function handleFlightStepChange(
    key: DecisionFlightStepKey,
    patch: Parameters<typeof updateDecisionFlightStep>[2],
  ) {
    if (!record || !flightRecordDraft) {
      return;
    }

    const nextRecord = updateDecisionFlightStep({ ...record, flightRecord: flightRecordDraft }, key, patch);
    setFlightRecordDraft(nextRecord.flightRecord);
    setFlightRecordSaved(false);
    setFlightRecordError("");
  }

  async function handleSaveFlightRecord() {
    if (!record || !flightRecordDraft) {
      return;
    }

    const now = new Date().toISOString();
    const nextRecord: SimulationRecord = {
      ...record,
      flightRecord: {
        ...flightRecordDraft,
        updatedAt: now,
      },
    };

    try {
      await saveRecord(nextRecord);
      setRecord(nextRecord);
      setFlightRecordDraft(ensureDecisionFlightRecord(nextRecord));
      setFlightRecordSaved(true);
      setFlightRecordError("");
    } catch {
      setFlightRecordSaved(false);
      setFlightRecordError("保存飞行记录失败，请稍后重试。");
    }
  }

  return (
    <PixelLayout>
      <div className="mb-4">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm font-bold text-pixel-cyan hover:text-pixel-yellow">
          <ArrowLeft size={16} />
          返回历史
        </Link>
      </div>

      {loading ? (
        <PixelCard title="读取案例" eyebrow="LOADING">
          <p className="text-pixel-muted">正在读取本地案例库...</p>
        </PixelCard>
      ) : !record ? (
        <PixelCard title="未找到案例" eyebrow="EMPTY">
          <p className="text-pixel-muted">该历史案例不存在或已被删除。</p>
        </PixelCard>
      ) : (
        <div className="grid gap-6">
          <PixelCard title="案例输入" eyebrow="RECORD">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <p>
                <span className="text-pixel-cyan">项目：</span>
                {record.input?.projectName || "未填写项目名称"}
              </p>
              <p>
                <span className="text-pixel-cyan">保存时间：</span>
                {new Date(record.createdAt).toLocaleString("zh-CN")}
              </p>
              <p className="md:col-span-2">
                <span className="text-pixel-cyan">问题：</span>
                {record.input?.currentProblem || "未填写当前问题"}
              </p>
              <p className="md:col-span-2">
                <span className="text-pixel-cyan">原方案：</span>
                {record.input?.proposedAction || "未填写原方案"}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <PixelButton type="button" variant="secondary" icon={<Download size={16} />} onClick={() => downloadRecordMarkdown(record)}>
                导出 Markdown
              </PixelButton>
              <PixelButton
                type="button"
                variant="secondary"
                icon={<Download size={16} />}
                onClick={() => record.input && downloadActionPack(record.input, record)}
                disabled={!record.input}
              >
                导出建议包 JSON
              </PixelButton>
            </div>
          </PixelCard>
          {flightRecordDraft && flightProgress && (
            <PixelCard title="决策飞行记录仪" eyebrow="DECISION FLIGHT">
              <div
                className={`mb-4 border-2 px-3 py-2 text-sm font-bold ${
                  flightProgress.canEnterCaseAsset
                    ? "border-pixel-green bg-[#14231a] text-pixel-green"
                    : "border-pixel-yellow bg-[#2a2317] text-pixel-yellow"
                }`}
              >
                <p>
                  {flightProgress.canEnterCaseAsset
                    ? "该案例已具备进入案例资产库的基础条件，仍需人工脱敏和复核。"
                    : "该案例仍缺少真实执行 / 现实反馈 / 判断升级记录，暂不建议进入案例资产。"}
                </p>
                <p className="mt-1 text-xs text-pixel-muted">
                  已完成 {flightProgress.completed} / {flightProgress.total}
                </p>
              </div>

              <div className="grid gap-4">
                {flightRecordDraft.steps.map((step, index) => (
                  <div key={step.key} className="border-2 border-pixel-border bg-[#101822] p-4">
                    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-bold text-pixel-yellow">
                          {index + 1}. {step.label}
                        </p>
                        <p className="mt-1 text-xs text-pixel-muted">更新时间：{step.updatedAt}</p>
                      </div>
                      <select
                        className="pixel-input md:w-48"
                        value={step.status}
                        onChange={(event) =>
                          handleFlightStepChange(step.key, { status: event.target.value as DecisionFlightStepStatus })
                        }
                      >
                        {flightStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="grid gap-2">
                      <span className="field-label">内容</span>
                      <textarea
                        className="pixel-input min-h-28"
                        value={step.content}
                        onChange={(event) => handleFlightStepChange(step.key, { content: event.target.value })}
                      />
                    </label>

                    <label className="mt-3 grid gap-2">
                      <span className="field-label">证据（每行一条）</span>
                      <textarea
                        className="pixel-input min-h-20"
                        value={evidenceToText(step.evidence)}
                        onChange={(event) => handleFlightStepChange(step.key, { evidence: textToEvidence(event.target.value) })}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PixelButton type="button" onClick={handleSaveFlightRecord} icon={<Save size={16} />}>
                  保存飞行记录
                </PixelButton>
                {flightRecordSaved && <span className="text-sm font-bold text-pixel-green">已保存</span>}
                {flightRecordError && <span className="text-sm font-bold text-pixel-red">{flightRecordError}</span>}
              </div>
            </PixelCard>
          )}
          <PixelCard title="推演质量核查" eyebrow="QUALITY">
            <CaseQualityPanel report={auditCaseQuality(record)} />
          </PixelCard>
          <SimulationResultView result={record} />
        </div>
      )}
    </PixelLayout>
  );
}
