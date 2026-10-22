import { useState } from "react";
import { ListState } from "@/features/classes/components/ListState";
import { ProgressList } from "@/features/classes/components/ProgressList";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { lastClassStorage } from "@/features/classes/utils/lastClassStorage";
import { MobileAppShell } from "@/shared/components/bvc/MobileAppShell";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { useAuth } from "@/shared/context/AuthContext";

// UC-12 entry from the lecturer navigation: pick an active class (default: the one opened last).
export function ProgressPage() {
  const { user } = useAuth();
  const { classes, isLoading } = useLecturerClasses();
  const [chosenClassId, setChosenClassId] = useState<string | null>(null);
  const activeClasses = classes.filter((item) => item.status === "ACTIVE");
  const remembered = user ? lastClassStorage.read(user.userId) : null;
  const defaultClassId = activeClasses.some((item) => item.id === remembered) ? remembered : (activeClasses[0]?.id ?? null);
  const classId = chosenClassId ?? defaultClassId;

  return (
    <MobileScreen>
      <MobileAppShell />
      <div className="flex flex-col gap-[10px] px-[18px] pt-[16px]">
        <h1 className="m-0 text-[25px] font-extrabold tracking-[-0.025em]">Tiến độ</h1>
        {activeClasses.length > 0 && (
          <select
            aria-label="Lớp"
            value={classId ?? ""}
            onChange={(event) => setChosenClassId(event.target.value)}
            className="h-[44px] rounded-[22px] border border-bvc-border-strong bg-white px-[12px] text-[14px] text-bvc-ink"
          >
            {activeClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {classId ? (
        <ProgressList key={classId} classId={classId} />
      ) : (
        <div className="px-[18px] pt-[14px]">
          <ListState isLoading={isLoading} error={null} isEmpty emptyMessage="Bạn chưa có lớp học nào đang hoạt động." onRetry={() => undefined}>
            {null}
          </ListState>
        </div>
      )}
    </MobileScreen>
  );
}
