/**
 * LinkButton – a styled anchor that looks like a button.
 * Use this for navigation CTAs instead of shadcn Button,
 * since Base UI's Button expects a native <button> element.
 */
import { cn } from "@/lib/utils";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
  external?: boolean;
  onClick?: () => void;
}

const variants = {
  default:
    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  outline:
    "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
  ghost:
    "text-primary hover:bg-primary/10",
};

const sizes = {
  sm: "h-8 px-4 text-xs",
  md: "h-10 px-6 text-sm",
  lg: "h-11 px-8 text-sm",
};

export default function LinkButton({
  href,
  children,
  variant = "default",
  size = "md",
  className,
  id,
  external = false,
  onClick,
}: LinkButtonProps) {
  return (
    <a
      id={id}
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
