type FormMessageProps = {
  children: string;
  variant?: "default" | "error" | "success";
};

const variantClasses = {
  default: "bg-slate-100 text-slate-700",
  error: "bg-rose-50 text-rose-700",
  success: "bg-emerald-50 text-emerald-700",
};

export function FormMessage({
  children,
  variant = "default",
}: FormMessageProps) {
  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}