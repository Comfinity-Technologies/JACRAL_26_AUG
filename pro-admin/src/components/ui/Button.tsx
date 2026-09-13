import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full px-7 py-3 font-medium transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#17382B] text-white hover:bg-[#1F4D3A]",

    secondary:
      "border border-[#17382B] bg-transparent text-[#17382B] hover:bg-[#17382B] hover:text-white",

    accent:
      "bg-[#C98B4A] text-white hover:opacity-90",

    ghost:
      "bg-transparent text-[#17382B] hover:bg-[#F3EFE5]",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="text-inherit">
        {children}
      </span>
    </button>
  );
}