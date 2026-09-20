import { Link } from "react-router-dom";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRightIcon className="size-4 text-outline" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="text-on-surface-variant hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-on-surface" : "text-on-surface-variant"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
