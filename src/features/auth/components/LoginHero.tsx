import studentImage from "@/assets/image/student.png";
import { cn } from "@/shared/utils/cn";

interface LoginHeroProps {
  className?: string;
}

// Ảnh sinh viên luyện đàn bo góc, phủ gradient xanh trong suốt để ảnh hợp tông BVC
export function LoginHero({ className }: LoginHeroProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-bvc-surface", className)}>
      <img src={studentImage} alt="Sinh viên luyện tập đàn nguyệt" className="size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-bvc-ink/75 via-bvc-accent/30 to-bvc-accent/5" />
    </div>
  );
}
