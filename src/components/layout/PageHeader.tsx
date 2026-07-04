"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "teal" | "warning";
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = "default",
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3", className)}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>
            {badge && <Badge variant={badgeVariant} className="text-[10px]">{badge}</Badge>}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}