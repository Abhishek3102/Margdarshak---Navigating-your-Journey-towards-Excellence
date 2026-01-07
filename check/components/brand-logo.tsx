import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string; // For container
  showTagline?: boolean;
  variant?: "default" | "large" | "footer"; // Adjust sizes
}

export function BrandLogo({ className, showTagline = true, variant = "default" }: BrandLogoProps) {
  
  // Size Configs
  const imgSize = variant === "large" ? "w-16 h-16" : "w-12 h-12";
  const titleSize = variant === "large" ? "text-4xl" : "text-2xl";
  const taglineSize = variant === "large" ? "text-sm" : "text-[11px]";

  return (
    <Link href="/" className={cn("flex items-center gap-3 group", className)}>
      <div className={cn("relative", imgSize)}>
        {/* Using standard img tag for simplicity, or could use Next Image */}
        <img 
          src="/images/gen_logo.png" 
          alt="Margdarshak Logo" 
          className="object-contain w-full h-full drop-shadow-lg group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex flex-col justify-center -space-y-0.5">
        <span className={cn(
          "font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-400",
          titleSize
        )}>
          Margdarshak
        </span>
        {showTagline && (
          <span className={cn(
            "text-slate-300 font-medium tracking-wide",
            taglineSize
          )}>
            Navigating your journey towards excellence
          </span>
        )}
      </div>
    </Link>
  );
}
