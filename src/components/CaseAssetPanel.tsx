"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { PixelButton } from "@/components/PixelButton";
import { normalizeShareableOutputs, normalizeWorkOutputs, type ShareableOutputSource } from "@/services/caseAssetService";
import type { CaseAsset, ShareableCaseOutput } from "@/types/simulation";

interface CaseAssetPanelProps {
  caseAsset: CaseAsset;
  source?: ShareableOutputSource;
}

function CaseList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-bold text-pixel-cyan">{title}</h3>
      <ul className="grid gap-2 text-sm text-pixel-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function CaseAssetPanel({ caseAsset, source }: CaseAssetPanelProps) {
  const [copiedKey, setCopiedKey] = useState("");
  const [failedKey, setFailedKey] = useState("");
  const outputSource = {
    ...source,
    caseName: caseAsset.caseName,
    exposedProblems: caseAsset.exposedProblems,
    reusableTemplates: caseAsset.reusableTemplates,
  };
  const shareableOutputs = normalizeShareableOutputs(caseAsset.shareableOutputs, outputSource);
  const workOutputs = normalizeWorkOutputs(caseAsset.shareableOutputs, outputSource);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    }
  }

  async function copyOutput(output: ShareableCaseOutput, key: string) {
    const copied = await copyText(output.content);

    if (!copied) {
      setFailedKey(key);
      window.setTimeout(() => setFailedKey(""), 1600);
      return;
    }

    setCopiedKey(key);
    setFailedKey("");
    window.setTimeout(() => setCopiedKey(""), 1600);
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-bold text-pixel-yellow">案例名称</h3>
          <p className="text-pixel-text">{caseAsset.caseName}</p>
        </div>
        <div>
          <h3 className="mb-2 font-bold text-pixel-yellow">案例类型</h3>
          <p className="text-pixel-text">{caseAsset.caseType}</p>
        </div>
        <CaseList title="暴露问题" items={caseAsset.exposedProblems} />
        <CaseList title="可复用模板" items={caseAsset.reusableTemplates} />
        <CaseList title="可形成 AI 工作流" items={caseAsset.aiWorkflows} />
        <div>
          <h3 className="mb-2 font-bold text-pixel-cyan">沉淀判断</h3>
          <p className="text-sm text-pixel-muted">适合培训案例：{caseAsset.suitableForTraining ? "是" : "否"}</p>
          <p className="mt-1 text-sm text-pixel-muted">适合内容化：{caseAsset.suitableForContent ? "是" : "否"}</p>
          {caseAsset.desensitizationNotes && (
            <p className="mt-3 border-2 border-pixel-border bg-[#101822] p-3 text-sm text-pixel-text">
              {caseAsset.desensitizationNotes}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-bold text-pixel-yellow">复制到工作</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {workOutputs.map((output) => {
            const key = output.outputType || output.title;

            return (
              <article key={key} className="border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-pixel-cyan">{output.title}</h4>
                    <p className="mt-1 text-xs text-pixel-muted">{output.workScenario || output.usage}</p>
                  </div>
                  <PixelButton type="button" variant="secondary" icon={<Copy size={16} />} onClick={() => copyOutput(output, key)}>
                    {copiedKey === key ? "已复制" : failedKey === key ? "复制失败" : output.copyLabel || "复制"}
                  </PixelButton>
                </div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-2 border-pixel-border bg-[#0d131c] p-3 text-sm leading-6 text-pixel-text">{output.content}</pre>
              </article>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-bold text-pixel-yellow">可直接分享成果</h3>
        <div className="grid gap-4">
          {shareableOutputs.map((output) => (
            <article key={output.title} className="border-2 border-pixel-border bg-[#101822] p-4 shadow-pixelSm">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-pixel-cyan">{output.title}</h4>
                  <p className="mt-1 text-xs text-pixel-muted">{output.usage}</p>
                </div>
                <PixelButton type="button" variant="secondary" icon={<Copy size={16} />} onClick={() => copyOutput(output, `share-${output.title}`)}>
                  {copiedKey === `share-${output.title}` ? "已复制" : failedKey === `share-${output.title}` ? "复制失败" : "复制"}
                </PixelButton>
              </div>
              <pre className="whitespace-pre-wrap border-2 border-pixel-border bg-[#0d131c] p-3 text-sm leading-6 text-pixel-text">{output.content}</pre>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
