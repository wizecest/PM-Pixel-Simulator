"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

const variantClasses = {
  primary: "border-pixel-yellow bg-pixel-yellow text-[#12151d] hover:bg-[#ffe17a]",
  secondary: "border-pixel-cyan bg-transparent text-pixel-cyan hover:bg-pixel-cyan hover:text-[#12151d]",
  danger: "border-pixel-red bg-transparent text-pixel-red hover:bg-pixel-red hover:text-[#12151d]",
};

export function PixelButton({ children, icon, className = "", variant = "primary", ...props }: PixelButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 py-2 font-bold shadow-pixelSm transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
