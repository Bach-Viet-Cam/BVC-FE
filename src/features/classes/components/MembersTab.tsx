import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { ListState } from "@/features/classes/components/ListState";
import { MemberCard } from "@/features/classes/components/MemberCard";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useClassActions } from "@/features/classes/hooks/useClassActions";
import { useMembers } from "@/features/classes/hooks/useMembers";
import { type AccountStatusFilter, type ClassDetail, type Member } from "@/features/classes/types/classTypes";
import { toast } from "@/shared/components/ui/toast";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface MembersTabProps {
  classDetail: ClassDetail;
  onMembersChanged: () => void;
}

const LINK_BUTTON_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-[6px] rounded-[12px] px-[12px] text-[13px] font-semibold";

export function MembersTab({ classDetail, onMembersChanged }: MembersTabProps) {
  const [searchText, setSearchText] = useState("");
  const [accountStatus, setAccountStatus] = useState<AccountStatusFilter>("ALL");
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { result, isLoading, error, reload } = useMembers(classDetail.id, { q: debouncedSearch, accountStatus });
  const { removeMember, isWorking } = useClassActions(classDetail.id);
  const canEdit = !classDetail.isReadOnly;
  const isFiltered = Boolean(debouncedSearch) || accountStatus !== "ALL";

  const confirmRemove = async () => {
    if (!memberToRemove) return;
    const outcome = await removeMember(memberToRemove.studentId);
    setMemberToRemove(null);
    if ("error" in outcome) {
      toast.error(outcome.error);
    } else {
      toast.success(outcome.message);
    }
    reload();
    onMembersChanged();
  };

  return (
    <>
      {canEdit && (
        <div className="grid shrink-0 grid-cols-2 gap-[8px] px-[18px] pb-[10px] pt-[14px] md:flex lg:px-[32px] lg:pt-[20px]">
          <Link
            to={`/teacher/classes/${classDetail.id}/members/new`}
            className={`${LINK_BUTTON_BASE} bg-bvc-ink text-white`}
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" /> Thêm sinh viên
          </Link>
          <Link
            to={`/teacher/classes/${classDetail.id}/import`}
            className={`${LINK_BUTTON_BASE} border border-bvc-border-strong bg-white text-bvc-ink`}
          >
            Nhập danh sách SV
          </Link>
        </div>
      )}
      <div
        className={`flex shrink-0 gap-[8px] px-[18px] pb-[10px] lg:max-w-[720px] lg:px-[32px] ${canEdit ? "" : "pt-[14px] lg:pt-[20px]"}`}
      >
        <SearchInput id="member-search" label="Tên hoặc mã sinh viên" value={searchText} onChange={setSearchText} />
        <select
          aria-label="Lọc tài khoản"
          value={accountStatus}
          onChange={(event) => setAccountStatus(event.target.value as AccountStatusFilter)}
          className="h-[46px] shrink-0 rounded-[22px] border border-bvc-border-strong bg-white px-[10px] text-[13px] text-bvc-ink"
        >
          <option value="ALL">Tài khoản: Tất cả</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="PENDING">Chờ kích hoạt</option>
        </select>
      </div>
      <div className="shrink-0 px-[18px] pb-[8px] text-[12.5px] text-bvc-muted lg:px-[32px]" aria-live="polite">
        Hiện {result?.pagination.total ?? 0} / {result?.totalMembers ?? 0} sinh viên
      </div>
      <div className="flex grow flex-col gap-[10px] px-[18px] pb-[12px] lg:px-[32px] lg:pb-[24px]">
        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={(result?.items.length ?? 0) === 0}
          emptyMessage={isFiltered ? "Không tìm thấy sinh viên phù hợp." : "Lớp chưa có sinh viên."}
          onRetry={reload}
        >
          <div className="grid gap-[10px] lg:grid-cols-2 2xl:grid-cols-3">
            {result?.items.map((member) => (
              <MemberCard key={member.studentId} member={member} canRemove={canEdit} onRemove={setMemberToRemove} />
            ))}
          </div>
        </ListState>
      </div>
      <ConfirmDialog
        isOpen={memberToRemove !== null}
        title={`Xóa sinh viên ${memberToRemove?.fullName ?? ""} khỏi lớp?`}
        description="Bài nộp và đánh giá trước đó vẫn được giữ lại."
        confirmLabel="Xóa"
        isConfirming={isWorking}
        onConfirm={confirmRemove}
        onCancel={() => setMemberToRemove(null)}
      />
    </>
  );
}
