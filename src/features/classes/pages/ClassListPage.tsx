import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ClassCard } from "@/features/classes/components/ClassCard";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { type ClassStatusFilter } from "@/features/classes/types/classTypes";
import { MobileAppShell } from "@/shared/components/bvc/MobileAppShell";
import { MobileScreen } from "@/shared/components/bvc/MobileScreen";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

const ALL = "ALL";
const STATUS_OPTIONS = [
  { value: ALL, label: "Tất cả" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "FINISHED", label: "Đã kết thúc" },
];

export function ClassListPage() {
  const [searchText, setSearchText] = useState("");
  const [cohort, setCohort] = useState(ALL);
  const [instrumentId, setInstrumentId] = useState(ALL);
  const [status, setStatus] = useState<ClassStatusFilter>("ACTIVE");
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { instruments } = useInstruments();
  const { result, isLoading, error, reload } = useClassList({
    q: debouncedSearch,
    cohort: cohort === ALL ? undefined : cohort,
    instrumentId: instrumentId === ALL ? undefined : instrumentId,
    status,
  });

  const cohortOptions = useMemo(
    () => [{ value: ALL, label: "Tất cả" }, ...(result?.cohorts ?? []).map((item) => ({ value: item, label: item }))],
    [result?.cohorts]
  );
  const instrumentOptions = useMemo(
    () => [{ value: ALL, label: "Tất cả" }, ...instruments.map((item) => ({ value: item.id, label: item.name }))],
    [instruments]
  );
  const hasNoClassAtAll = (result?.cohorts.length ?? 0) === 0;
  const emptyMessage = hasNoClassAtAll ? "Bạn chưa có lớp học nào." : "Không tìm thấy lớp học phù hợp.";

  return (
    <MobileScreen>
      <MobileAppShell />
      <div className="flex shrink-0 items-end justify-between px-[18px] pb-[10px] pt-[16px]">
        <div className="flex flex-col gap-[3px]">
          <h1 className="m-0 text-[25px] font-extrabold tracking-[-0.025em]">Lớp học của tôi</h1>
          <span className="text-[12.5px] text-bvc-muted">{result?.activeCount ?? 0} lớp đang hoạt động</span>
        </div>
        <Link
          to="/teacher/classes/new"
          className="inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-semibold text-white"
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" /> Tạo mới
        </Link>
      </div>
      <div className="flex shrink-0 px-[18px] pb-[10px]">
        <SearchInput id="class-search" label="Tìm lớp" value={searchText} onChange={setSearchText} />
      </div>
      <div className="no-scrollbar flex shrink-0 gap-[7px] overflow-x-auto px-[18px] pb-[12px]">
        <FilterSelect label="Khóa" value={cohort} allValue={ALL} options={cohortOptions} onChange={setCohort} />
        <FilterSelect
          label="Nhạc cụ"
          value={instrumentId}
          allValue={ALL}
          options={instrumentOptions}
          onChange={setInstrumentId}
        />
        <FilterSelect
          label="Trạng thái"
          value={status}
          allValue={ALL}
          options={STATUS_OPTIONS}
          onChange={(value) => setStatus(value as ClassStatusFilter)}
        />
      </div>
      <div className="flex grow flex-col gap-[10px] px-[18px] pb-[22px]">
        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={(result?.items.length ?? 0) === 0}
          emptyMessage={emptyMessage}
          onRetry={reload}
        >
          <div className="grid gap-[10px] lg:grid-cols-2">
            {result?.items.map((classSummary) => (
              <ClassCard key={classSummary.id} classSummary={classSummary} />
            ))}
          </div>
        </ListState>
        <span className="text-[12.5px] text-bvc-muted">Chỉ hiện lớp do bạn phụ trách.</span>
      </div>
    </MobileScreen>
  );
}
