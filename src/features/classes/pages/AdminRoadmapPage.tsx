import { useState } from "react";
import { AdminRoadmapPanel } from "@/features/classes/components/AdminRoadmapPanel";
import { AdminShell } from "@/shared/components/bvc/AdminShell";

// UC-11 "Quản Lý Lộ Trình" (System Admin, desktop).
export function AdminRoadmapPage() {
  const [instrumentId, setInstrumentId] = useState<string | null>(null);

  return (
    <AdminShell title="Quản lý lộ trình" subtitle="Lộ trình 6 tuần theo nhạc cụ · lưu tạo phiên bản mới">
      <AdminRoadmapPanel selectedInstrumentId={instrumentId} onSelectInstrument={setInstrumentId} />
    </AdminShell>
  );
}

