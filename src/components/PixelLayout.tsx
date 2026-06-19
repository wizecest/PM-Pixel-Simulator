import { History, Home } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PixelLayoutProps {
  children: ReactNode;
}

export function PixelLayout({ children }: PixelLayoutProps) {
  return (
    <div className="min-h-screen bg-pixel-bg text-pixel-text">
      <div className="pixel-backdrop" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-pixel-border pb-4">
          <Link href="/" className="flex items-center gap-3 text-pixel-yellow">
            <span className="grid size-10 place-items-center border-2 border-pixel-yellow bg-[#151923] shadow-pixelSm">
              <Home size={20} />
            </span>
            <span>
              <span className="block text-xl font-black">PM Pixel Simulator</span>
              <span className="block text-xs text-pixel-muted">项目管理像素模拟器</span>
            </span>
          </Link>
          <Link
            href="/history"
            className="inline-flex min-h-10 items-center gap-2 border-2 border-pixel-cyan px-3 py-2 text-sm font-bold text-pixel-cyan shadow-pixelSm transition hover:bg-pixel-cyan hover:text-[#12151d]"
          >
            <History size={16} />
            历史案例
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
