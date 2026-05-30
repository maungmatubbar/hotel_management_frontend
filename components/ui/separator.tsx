import * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}
