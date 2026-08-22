"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TactileButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "terracotta" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  glow?: boolean;
}

export function TactileButton({
  children,
  variant = "primary",
  size = "md",
  className,
  glow = true,
  ...props
}: TactileButtonProps) {
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 border border-amber-300/40 dark:border-amber-400/20",
    secondary:
      "bg-white/80 dark:bg-stone-800/80 text-stone-800 dark:text-stone-100 border border-amber-200/60 dark:border-stone-700/60 shadow-sm hover:shadow-md hover:border-amber-400/50 backdrop-blur-md",
    terracotta:
      "bg-gradient-to-r from-rose-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 border border-rose-300/30",
    emerald:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 border border-emerald-300/30",
    ghost:
      "bg-transparent text-stone-700 dark:text-stone-300 hover:bg-amber-100/50 dark:hover:bg-stone-800/50"
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-2xl gap-2 font-medium",
    lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5 font-semibold",
    icon: "h-10 w-10 p-0 rounded-2xl flex items-center justify-center"
  };

  return (
    <motion.button
      whileHover={{
        y: -3,
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 15 }
      }}
      whileTap={{
        scale: 0.94,
        y: 1,
        transition: { type: "spring", stiffness: 500, damping: 15 }
      }}
      className={cn(
        "relative inline-flex items-center justify-center outline-none transition-colors duration-200 cursor-pointer select-none",
        variantStyles[variant],
        sizeStyles[size],
        glow && variant !== "ghost" && "hover:ring-4 hover:ring-amber-400/20 dark:hover:ring-amber-500/20",
        className
      )}
      {...props}
    >
      {/* Soft inner glow reflection line */}
      <span className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {children}
    </motion.button>
  );
}
