import { Download } from "lucide-react";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { usePwaInstall } from "@/shared/hooks/usePwaInstall";

// Chrome/Edge mở hộp thoại cài đặt ngay; Safari không hỗ trợ nên dẫn sang trang hướng dẫn
export function InstallAppButton() {
  const { canPrompt, isInstalled, promptInstall } = usePwaInstall();
  if (isInstalled) return null;

  return (
    <PillLink
      to={canPrompt ? undefined : "/install"}
      onClick={canPrompt ? () => void promptInstall() : undefined}
      label="Thêm vào màn hình chính"
      variant="glass"
      icon={Download}
    />
  );
}
