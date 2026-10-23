import { cn } from "@/shared/utils/cn";

interface TeacherScreenProps {
  children: React.ReactNode;
  className?: string;
}

// Lecturer page frame inside TeacherShell: full content width on web (the page scrolls itself
// next to the sidebar), plain document flow on phones.
export function TeacherScreen({ children, className }: TeacherScreenProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-white font-bvc-sans text-bvc-ink lg:min-h-0 lg:overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
