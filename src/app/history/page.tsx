"use client";

import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { deleteRecord, getRecords } from "@/services/storageService";
import type { SimulationRecord } from "@/types/simulation";

export default function HistoryPage() {
  const [records, setRecords] = useState<SimulationRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch(() => setError("读取历史案例失败，无法打开本地案例库文件。"));
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteRecord(id);
      setRecords(await getRecords());
    } catch {
      setError("删除失败，无法写入本地案例库文件。");
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

      <PixelCard title="历史案例" eyebrow="HISTORY">
        {error && <p className="mb-4 border-2 border-pixel-red bg-[#2a171a] px-3 py-2 text-sm text-pixel-red">{error}</p>}
        {records.length === 0 ? (
          <p className="text-pixel-muted">暂无历史案例。</p>
        ) : (
          <div className="grid gap-3">
            {records.map((record) => (
              <article
                key={record.id}
                className="grid gap-4 border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm md:grid-cols-[1fr_auto]"
              >
                <div>
                  <h2 className="text-lg font-bold text-pixel-yellow">{record.levelName}</h2>
                  <p className="mt-1 text-sm text-pixel-muted">{record.input.projectName}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-pixel-text">{record.input.currentProblem}</p>
                  <p className="mt-2 text-xs text-pixel-muted">{new Date(record.createdAt).toLocaleString("zh-CN")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Link className="pixel-link-button" href={`/history/${record.id}`}>
                    <Eye size={16} />
                    打开
                  </Link>
                  <PixelButton type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(record.id)}>
                    删除
                  </PixelButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </PixelCard>
    </PixelLayout>
  );
}
