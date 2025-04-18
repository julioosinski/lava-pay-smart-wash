
import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  bgColor?: string;
}

const ProgressCustom = React.forwardRef<HTMLDivElement, CustomProgressProps>(
  ({ className, value, bgColor = "bg-lavapay-500", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-all", bgColor)}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    );
  }
);

ProgressCustom.displayName = "ProgressCustom";

export { ProgressCustom };
