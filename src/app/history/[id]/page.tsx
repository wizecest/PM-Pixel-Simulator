"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { CaseQualityPanel } from "@/components/CaseQualityPanel";
import { SimulationResultView } from "@/components/SimulationResultView";
import { auditCaseQuality } from "@/services/caseQualityService";
import { downloadRecordMarkdown } from "@/services/exportService";
import { getRecordById } from "@/services/storageService";
import type { SimulationRecord } from "@/types/simulation";

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<SimulationRecord>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRecordById(params.id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [params.id]);

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
            </div>
          </PixelCard>
          <PixelCard title="推演质量核查" eyebrow="QUALITY">
            <CaseQualityPanel report={auditCaseQuality(record)} />
          </PixelCard>
          <SimulationResultView result={record} />
        </div>
      )}
    </PixelLayout>
  );
}
