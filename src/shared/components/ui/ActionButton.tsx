import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

type ActionButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ActionButtonSize = "sm" | "md";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: LucideIcon;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
};

const variantClasses: Record<ActionButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "border border-border bg-surface text-text-primary hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-text-secondary hover:bg-surface-soft hover:text-text-primary",
  danger: "bg-red text-white hover:bg-red",
};

const sizeClasses: Record<ActionButtonSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-11 px-4 text-[14px]",
};

export function ActionButton({
  children,
  className,
  icon: Icon,
  size = "md",
  type = "button",
  variant = "primary",
  ...buttonProps
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...buttonProps}
    >
      {Icon ? <Icon aria-hidden="true" size={17} strokeWidth={2.5} /> : null}
      <span>{children}</span>
    </button>
  );
}
