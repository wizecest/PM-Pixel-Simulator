import { PixelCard } from "@/components/PixelCard";
import { PixelLayout } from "@/components/PixelLayout";
import { ScenarioForm } from "@/components/ScenarioForm";

export default function HomePage() {
  return (
    <PixelLayout>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <PixelCard title="新建模拟" eyebrow="START">
          <ScenarioForm />
        </PixelCard>

        <aside className="pixel-card overflow-hidden">
          <div className="pixel-office" aria-hidden="true">
            <div className="pixel-window window-a" />
            <div className="pixel-window window-b" />
            <div className="pixel-board" />
            <div className="pixel-desk desk-a" />
            <div className="pixel-desk desk-b" />
            <div className="pixel-screen screen-a" />
            <div className="pixel-screen screen-b" />
            <div className="pixel-character char-a" />
            <div className="pixel-character char-b" />
          </div>
          <div className="mt-5 grid gap-3 text-sm text-pixel-muted">
            <p className="border-l-4 border-pixel-yellow pl-3 text-pixel-text">项目总部作战室</p>
            <p>节点板、责任表、风险清单和资料柜已就绪。</p>
          </div>
        </aside>
      </div>
    </PixelLayout>
  );
}
