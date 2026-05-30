import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex w-fit items-center rounded-lg px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      inverted: "bg-white/15 text-white backdrop-blur",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
