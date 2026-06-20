import { Suspense } from "react";
import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { ProjectBridgeLauncher } from "@/components/ProjectBridgeLauncher";

export default function FromProjectPage() {
  return (
    <PixelLayout>
      <Suspense
        fallback={
          <PixelCard title="连接真实项目" eyebrow="NEXUS → PM PIXEL">
            <p className="text-sm text-pixel-muted">正在准备项目快照。</p>
          </PixelCard>
        }
      >
        <ProjectBridgeLauncher />
      </Suspense>
    </PixelLayout>
  );
}
