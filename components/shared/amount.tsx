import * as React from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react";
import { formatMoney } from "@/lib/finance";
import { cn } from "@/lib/utils";

export interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Amount in minor units (paisa/cents).
   * e.g., 762200 for ৳7,622.
   */
  amount: number;
  /**
   * Sign type to apply accessible color and direction icon.
   */
  sign?: "positive" | "negative" | "neutral" | "none";
  /**
   * Whether to show the direction icon when sign is set. Defaults to true.
   */
  showIcon?: boolean;
  /**
   * Optional custom currency code (defaults to BDT)
   */
  currencyCode?: string;
  /**
   * Additional custom CSS classes.
   */
  className?: string;
}

export function Amount({
  amount,
  sign = "none",
  showIcon = true,
  currencyCode = "BDT",
  className,
  ...props
}: AmountProps) {
  const formatted = formatMoney(amount, currencyCode);

  let colorClasses = "";
  let Icon: React.ComponentType<{ className?: string }> | null = null;

  if (sign === "positive") {
    colorClasses = "text-emerald-500 dark:text-emerald-400";
    Icon = ArrowUpRight;
  } else if (sign === "negative") {
    colorClasses = "text-rose-500 dark:text-rose-400";
    Icon = ArrowDownLeft;
  } else if (sign === "neutral") {
    colorClasses = "text-indigo-500 dark:text-indigo-400";
    Icon = ArrowRightLeft;
  }

  return (
    <span
      className={cn(
        "font-mono tabular-nums inline-flex items-center gap-1",
        colorClasses,
        className
      )}
      {...props}
    >
      {showIcon && Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />}
      <span>{formatted}</span>
    </span>
  );
}
