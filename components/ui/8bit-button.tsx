"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface EightBitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "default" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function EightBitButton({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: EightBitButtonProps) {
  const variantStyles = {
    primary:
      "bg-green-600 border-green-400 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]",
    secondary:
      "bg-gray-700 border-gray-500 hover:bg-gray-600 text-gray-200 shadow-[0_0_10px_rgba(100,116,139,0.4)]",
    success:
      "bg-emerald-600 border-emerald-400 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    warning:
      "bg-yellow-600 border-yellow-400 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]",
    default:
      "bg-green-600 border-green-400 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]",
    outline:
      "bg-transparent border-green-500 hover:bg-green-900/30 text-green-200 shadow-[0_0_10px_rgba(34,197,94,0.25)]",
    destructive:
      "bg-red-700 border-red-400 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.45)]",
  };
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-3.5 text-sm",
  };

  return (
    <button
      className={cn(
        "relative font-bold uppercase tracking-wider",
        "border-4 transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        "active:translate-y-1 active:shadow-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Export as Button for backward compatibility
export const Button = EightBitButton;
