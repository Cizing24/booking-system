import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-700 focus-visible:outline-slate-900",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </Link>
  );
}