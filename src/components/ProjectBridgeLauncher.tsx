"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PixelCard } from "@/components/PixelCard";
import { saveCurrentInput } from "@/services/storageService";
import type { ScenarioInput } from "@/types/simulation";

interface BridgeResponse {
  ok: boolean;
  error?: string;
  input?: ScenarioInput;
  database_generated_at?: string;
}

export function ProjectBridgeLauncher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("正在读取 pm-obsidian 项目快照");

  useEffect(() => {
    let cancelled = false;

    async function launchFromProject() {
      if (!queryString) {
        setError("缺少项目参数，请从 Nexus 项目作战页进入。");
        return;
      }

      try {
        const response = await fetch(`/api/pm-obsidian-project?${queryString}`, { cache: "no-store" });
        const payload = (await response.json()) as BridgeResponse;
        if (!response.ok || !payload.ok || !payload.input) {
          throw new Error(payload.error || `HTTP ${response.status}`);
        }

        saveCurrentInput(payload.input);
        if (!cancelled) {
          setStatus(`已读取 ${payload.input.projectName}，正在进入推演页`);
          router.replace("/simulate");
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "项目快照读取失败。");
        }
      }
    }

    launchFromProject();
    return () => {
      cancelled = true;
    };
  }, [queryString, router]);

  return (
    <PixelCard title="连接真实项目" eyebrow="NEXUS → PM PIXEL">
      <div className="grid gap-3 text-sm text-pixel-muted">
        <p>{status}</p>
        {error && (
          <div className="border-2 border-pixel-red bg-[#2a171a] px-3 py-2 text-pixel-red">
            <p className="font-bold">无法进入沙盘推演</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
        {error && (
          <div className="flex flex-wrap gap-3">
            <Link className="pixel-link-button" href="/">
              返回首页
            </Link>
            <Link className="pixel-link-button" href="/history">
              查看历史案例
            </Link>
          </div>
        )}
      </div>
    </PixelCard>
  );
}
