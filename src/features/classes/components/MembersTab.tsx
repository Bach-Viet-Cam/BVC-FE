import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { AddStudentDialog } from "@/features/classes/components/AddStudentDialog";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { FilterSelect } from "@/features/classes/components/FilterSelect";
import { ListState } from "@/features/classes/components/ListState";
import { MemberCard } from "@/features/classes/components/MemberCard";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { useClassActions } from "@/features/classes/hooks/useClassActions";
import { useMembers } from "@/features/classes/hooks/useMembers";
import { type AccountStatusFilter, type ClassDetail, type Member } from "@/features/classes/types/classTypes";
import { ACCOUNT_STATUS_LABELS } from "@/features/classes/utils/classFormat";
import { toast } from "@/shared/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@/shared/components/ui/table";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useCreateDialog } from "@/shared/hooks/useCreateDialog";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface MembersTabProps {
  classDetail: ClassDetail;
  onMembersChanged: () => void;
}

const ACCOUNT_OPTIONS: Array<{ value: AccountStatusFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: ACCOUNT_STATUS_LABELS.ACTIVE },
  { value: "PENDING", label: ACCOUNT_STATUS_LABELS.PENDING },
];

interface MemberTableProps {
  classId: string;
  members: Member[];
  canRemove: boolean;
  onRemove: (member: Member) => void;
}

function MemberTable({ classId, members, canRemove, onRemove }: MemberTableProps) {
  return (
    <Table className="min-w-[680px]">
      <TableHead>
        <TableHeaderRow>
          <TableHeaderCell>Họ tên</TableHeaderCell>
          <TableHeaderCell>Mã SV</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Tài khoản</TableHeaderCell>
          {canRemove && (
            <TableHeaderCell className="w-[1%]">
              <span className="sr-only">Thao tác</span>
            </TableHeaderCell>
          )}
        </TableHeaderRow>
      </TableHead>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.studentId}>
            <TableCell className="max-w-[260px] truncate font-medium">
              <Link
                to={`/teacher/classes/${classId}/students/${member.studentId}`}
                className="text-bvc-ink hover:underline"
              >
                {member.fullName}
              </Link>
            </TableCell>
            <TableCell className="font-bvc-mono">{member.studentCode ?? "-"}</TableCell>
            <TableCell className="max-w-[260px] truncate text-bvc-muted">{member.email}</TableCell>
            <TableCell>
              <StatusLabel
                label={ACCOUNT_STATUS_LABELS[member.accountStatus]}
                tone={member.accountStatus === "ACTIVE" ? "ok" : "warn"}
              />
            </TableCell>
            {canRemove && (
              <TableCell>
                <button
                  type="button"
                  onClick={() => onRemove(member)}
                  aria-label={`Xóa ${member.fullName} khỏi lớp`}
                  className="cursor-pointer text-[13px] font-medium text-bvc-error"
                >
                  Xóa
                </button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function MembersTab({ classDetail, onMembersChanged }: MembersTabProps) {
  const isMobile = useIsMobile();
  const [searchText, setSearchText] = useState("");
  const [accountStatus, setAccountStatus] = useState<AccountStatusFilter>("ALL");
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { result, isLoading, error, reload } = useMembers(classDetail.id, { q: debouncedSearch, accountStatus });
  const { removeMember, isWorking } = useClassActions(classDetail.id);
  const canEdit = !classDetail.isReadOnly;
  const isFiltered = Boolean(debouncedSearch) || accountStatus !== "ALL";
  const createDialog = useCreateDialog("member");
  const members = result?.items ?? [];

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
    <div className="flex grow flex-col gap-[10px] px-[18px] pb-[18px] pt-[14px] lg:px-[32px] lg:pb-[24px] lg:pt-[18px]">
      <div className="flex shrink-0 flex-wrap items-center gap-[8px]">
        <div className="flex min-w-0 basis-full sm:basis-auto sm:grow lg:max-w-[420px]">
          <SearchInput id="member-search" label="Tên hoặc mã sinh viên" value={searchText} onChange={setSearchText} />
        </div>
        <FilterSelect
          label="Tài khoản"
          value={accountStatus}
          allValue="ALL"
          options={ACCOUNT_OPTIONS}
          onChange={(value) => setAccountStatus(value as AccountStatusFilter)}
        />
        <span className="text-[12.5px] whitespace-nowrap text-bvc-muted" aria-live="polite">
          {result?.pagination.total ?? 0} / {result?.totalMembers ?? 0} SV
        </span>
        {canEdit && (
          <div className="ml-auto flex gap-[8px]">
            <Link
              to={`/teacher/classes/${classDetail.id}/import`}
              className={actionButtonClass("secondary", "md", "hover:text-bvc-ink")}
            >
              <Upload size={15} strokeWidth={1.9} aria-hidden="true" />
              <span className="max-sm:sr-only">Nhập danh sách SV</span>
            </Link>
            <ActionButton onClick={() => createDialog.open()}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" /> Thêm sinh viên
            </ActionButton>
          </div>
        )}
      </div>
      <ListState
        isLoading={isLoading}
        error={error}
        isEmpty={members.length === 0}
        emptyMessage={isFiltered ? "Không tìm thấy sinh viên phù hợp." : "Lớp chưa có sinh viên."}
        onRetry={reload}
      >
        {isMobile ? (
          <div className="flex flex-col gap-[10px]">
            {members.map((member) => (
              <MemberCard key={member.studentId} member={member} canRemove={canEdit} onRemove={setMemberToRemove} />
            ))}
          </div>
        ) : (
          <MemberTable classId={classDetail.id} members={members} canRemove={canEdit} onRemove={setMemberToRemove} />
        )}
      </ListState>
      {canEdit && (
        <AddStudentDialog
          open={createDialog.isOpen}
          classDetail={classDetail}
          onClose={createDialog.close}
          onAdded={() => {
            reload();
            onMembersChanged();
          }}
        />
      )}
      <ConfirmDialog
        open={memberToRemove !== null}
        title={`Xóa sinh viên ${memberToRemove?.fullName ?? ""} khỏi lớp?`}
        description="Bài nộp và đánh giá trước đó vẫn được giữ lại."
        confirmLabel="Xóa"
        isLoading={isWorking}
        onConfirm={confirmRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      />
    </div>
  );
}
