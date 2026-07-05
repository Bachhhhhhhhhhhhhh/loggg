"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "teal" | "warning";
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  variant?: "default" | "hero";
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  badge,
  badgeVariant = "default",
  icon,
  actions,
  className,
  variant = "default",
}: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "pro-page-header flex flex-col sm:flex-row sm:items-start justify-between gap-4",
        variant === "hero" && "pb-6",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-teal-500/10 border border-blue-500/25 text-blue-400 shrink-0 shadow-lg shadow-blue-500/5">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600 mb-1.5">
              {eyebrow}
            </p>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className={cn(
                "font-bold text-slate-50 tracking-tight text-balance",
                variant === "hero" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              )}
            >
              {title}
            </h1>
            {badge && (
              <Badge variant={badgeVariant} className="text-[9px] font-mono tracking-wide">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1.5 font-mono tracking-wide leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.header>
  );
}