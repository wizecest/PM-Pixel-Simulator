import type { ReactNode } from "react";

interface PixelCardProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function PixelCard({ title, eyebrow, children, className = "" }: PixelCardProps) {
  return (
    <section className={`pixel-card ${className}`}>
      {(eyebrow || title) && (
        <header className="mb-4 border-b-2 border-pixel-border pb-3">
          {eyebrow && <p className="mb-1 text-xs font-bold text-pixel-cyan">{eyebrow}</p>}
          {title && <h2 className="text-lg font-bold text-pixel-yellow">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  );
}
