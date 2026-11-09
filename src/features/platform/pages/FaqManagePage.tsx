import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, EyeOff, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FAQ_SCHEMA, type FaqFormValues } from "@/features/platform/utils/validateFaq";
import { faqApi } from "@/features/platform/api/faqApi";
import { instrumentApi } from "@/features/platform/api/instrumentApi";
import { FAQ_TOPICS, type FaqItem } from "@/features/platform/types/faqTypes";
import type { InstrumentItem } from "@/features/platform/types/configTypes";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { ConfirmDialog } from "@/shared/components/bvc/ConfirmDialog";
import { DesktopPageHeader } from "@/shared/components/bvc/DesktopPageHeader";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

interface FaqActionsProps {
  item: FaqItem;
  disabled: boolean;
  editDisabled: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

function FaqActions({ item, disabled, editDisabled, onEdit, onToggle, onDelete }: FaqActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ActionButton
        variant="secondary"
        aria-label={`Sửa câu hỏi: ${item.question}`}
        onClick={onEdit}
        disabled={disabled || editDisabled}
        className="min-h-11 px-3"
      >
        <Pencil size={15} aria-hidden />
        Sửa
      </ActionButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Tùy chọn câu hỏi: ${item.question}`}
          title="Thao tác khác"
          disabled={disabled}
          className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-bvc-border-strong text-bvc-ink hover:bg-bvc-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-ink disabled:opacity-50"
        >
          <MoreHorizontal size={18} aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-52 rounded-[14px] border-bvc-border-strong bg-white p-1.5 shadow-none">
          <DropdownMenuItem
            onClick={onToggle}
            className="min-h-11 gap-3 rounded-[9px] px-3 text-bvc-ink data-highlighted:bg-bvc-surface data-highlighted:text-bvc-ink"
          >
            {item.isActive ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            {item.isActive ? "Ẩn câu hỏi" : "Hiển thị câu hỏi"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="min-h-11 gap-3 rounded-[9px] px-3 text-bvc-error data-highlighted:bg-bvc-surface data-highlighted:text-bvc-error"
          >
            <Trash2 size={16} aria-hidden />
            Xóa vĩnh viễn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function FaqVisibility({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[9px] border border-bvc-border px-2.5 py-1.5 text-xs font-medium text-bvc-ink">
      <span aria-hidden className={`size-[7px] shrink-0 rounded-full ${active ? "bg-bvc-ok" : "bg-bvc-bar-strong"}`} />
      {active ? "Đang hiển thị" : "Đang ẩn"}
    </span>
  );
}

function FaqEditor({
  item,
  instruments,
  onSaved,
  onCancel,
  onDirtyChange,
}: {
  item: FaqItem | null;
  instruments: InstrumentItem[];
  onSaved: () => void;
  onCancel: () => void;
  onDirtyChange: (value: boolean) => void;
}) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(FAQ_SCHEMA),
    defaultValues: {
      question: item?.question ?? "",
      answer: item?.answer ?? "",
      topic: item?.topic ?? "COURSE_RULES",
      instrumentId: item?.instrumentId ?? "",
      displayOrder: item?.displayOrder ?? 0,
      isActive: item?.isActive ?? true,
    },
  });
  useReportDirty(isDirty, onDirtyChange);
  const submit = async (values: FaqFormValues) => {
    setSaveError(null);
    try {
      await faqApi.save(item?.id ?? null, {
        question: values.question,
        answer: values.answer,
        topic: values.topic,
        instrumentId: values.instrumentId || null,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
      });
      toast.success("Đã lưu câu hỏi.");
      onSaved();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  };
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FormBody>
        <FormField label="Câu hỏi" htmlFor="faq-question" required error={errors.question?.message}>
          <input
            id="faq-question"
            className={INPUT_CLASSES}
            maxLength={300}
            aria-invalid={Boolean(errors.question)}
            {...register("question")}
          />
        </FormField>
        <FormField label="Câu trả lời" htmlFor="faq-answer" required error={errors.answer?.message}>
          <textarea
            id="faq-answer"
            rows={7}
            maxLength={10000}
            className={`${INPUT_CLASSES} h-auto min-h-[180px] py-3`}
            aria-invalid={Boolean(errors.answer)}
            {...register("answer")}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Chủ đề" htmlFor="faq-topic" required error={errors.topic?.message}>
            <select id="faq-topic" className={INPUT_CLASSES} {...register("topic")}>
              {Object.entries(FAQ_TOPICS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Áp dụng cho nhạc cụ" htmlFor="faq-instrument">
            <select id="faq-instrument" className={INPUT_CLASSES} {...register("instrumentId")}>
              <option value="">Tất cả nhạc cụ</option>
              {instruments
                .filter((instrument) => instrument.isActive || instrument.id === item?.instrumentId)
                .map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                    {instrument.isActive ? "" : " (đã ngừng)"}
                  </option>
                ))}
            </select>
          </FormField>
          <FormField
            label="Thứ tự hiển thị"
            htmlFor="faq-order"
            hint="Số nhỏ hiện trước"
            error={errors.displayOrder?.message}
          >
            <input
              id="faq-order"
              type="number"
              min={0}
              max={9999}
              className={`${INPUT_CLASSES} font-bvc-mono`}
              aria-invalid={Boolean(errors.displayOrder)}
              {...register("displayOrder", { valueAsNumber: true })}
            />
          </FormField>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm">
            <input type="checkbox" className="size-5 accent-bvc-ink" {...register("isActive")} />
            Hiển thị cho người học
          </label>
        </div>
        {saveError && (
          <p role="alert" className="text-sm text-bvc-accent-text">
            {saveError}
          </p>
        )}
      </FormBody>
      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" isLoading={isSubmitting}>
          Lưu câu hỏi
        </ActionButton>
      </FormFooter>
    </form>
  );
}

export function FaqManagePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const topic = searchParams.get("topic") ?? "";
  const instrumentId = searchParams.get("instrumentId") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const parsedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const debouncedQuery = useDebouncedValue(q);
  const params = {
    q: debouncedQuery,
    status,
    ...(topic ? { topic } : {}),
    ...(instrumentId ? { instrumentId } : {}),
    page,
    pageSize: 20,
  };
  const list = useAsyncData(() => faqApi.list(params, true), `admin-faqs:${JSON.stringify(params)}`);
  const instruments = useAsyncData(
    async () => (await instrumentApi.list({ status: "all", sortBy: "name", sortDir: "asc" })).data.data,
    "admin-faq-instruments"
  );
  const [editor, setEditor] = useState<{ item: FaqItem | null } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const updateFilter = (name: string, value: string) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(name, value);
        else next.delete(name);
        if (name !== "page") next.delete("page");
        return next;
      },
      { replace: name === "q" }
    );
  const openEditor = (item: FaqItem | null) => {
    setIsDirty(false);
    setEditor({ item });
  };
  const mutate = async (item: FaqItem, remove = false) => {
    if (pendingId) return;
    setPendingId(item.id);
    try {
      if (remove) {
        await faqApi.remove(item.id);
        setDeleteTarget(null);
        if (list.data?.items.length === 1 && page > 1) updateFilter("page", String(page - 1));
        else list.reload();
      } else {
        await faqApi.setActive(item.id, !item.isActive);
        list.reload();
      }
      toast.success(remove ? "Đã xóa câu hỏi." : item.isActive ? "Đã ẩn câu hỏi." : "Đã hiển thị câu hỏi.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingId(null);
    }
  };
  const stale = list.isLoading || q !== debouncedQuery;
  const pageCount = Math.max(1, Math.ceil((list.data?.total ?? 0) / 20));

  return (
    <TeacherScreen>
      <DesktopPageHeader
        title="Quản lý câu hỏi thường gặp"
        actions={
          <ActionButton onClick={() => openEditor(null)} disabled={Boolean(instruments.error) || instruments.isLoading}>
            <Plus size={17} aria-hidden />
            Thêm câu hỏi
          </ActionButton>
        }
      />
      <div className="@container mx-auto flex w-full max-w-[1360px] min-w-0 flex-col gap-6 px-[18px] py-6 md:px-8">
        <p className="max-w-[75ch] text-sm leading-relaxed text-bvc-muted">
          Quản lý các câu trả lời trong mục Trợ giúp. Chỉ câu hỏi đang hiển thị mới được học sinh và giảng viên nhìn
          thấy.
        </p>
        <section
          aria-label="Lọc câu hỏi quản trị"
          className="grid min-w-0 gap-4 rounded-[16px] bg-bvc-surface p-4 sm:grid-cols-2 @min-[1050px]:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
        >
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-bvc-ink">
            Tìm kiếm
            <span className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bvc-muted"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Câu hỏi hoặc câu trả lời..."
                maxLength={300}
                className={`${INPUT_CLASSES} bg-white pl-10 placeholder:text-bvc-muted`}
                value={q}
                onChange={(event) => updateFilter("q", event.target.value)}
              />
            </span>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-bvc-ink">
            Chủ đề
            <select
              className={`${INPUT_CLASSES} bg-white`}
              value={topic}
              onChange={(event) => updateFilter("topic", event.target.value)}
            >
              <option value="">Tất cả chủ đề</option>
              {Object.entries(FAQ_TOPICS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-bvc-ink">
            Nhạc cụ
            <select
              className={`${INPUT_CLASSES} bg-white`}
              value={instrumentId}
              onChange={(event) => updateFilter("instrumentId", event.target.value)}
              disabled={Boolean(instruments.error)}
            >
              <option value="">Tất cả nhạc cụ</option>
              {instruments.data?.map((instrument) => (
                <option key={instrument.id} value={instrument.id}>
                  {instrument.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-bvc-ink">
            Hiển thị
            <select
              className={`${INPUT_CLASSES} bg-white`}
              value={status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hiển thị</option>
              <option value="HIDDEN">Đang ẩn</option>
            </select>
          </label>
        </section>
        {instruments.error && (
          <p role="alert" className="text-sm text-bvc-accent-text">
            Không tải được danh sách nhạc cụ.{" "}
            <button type="button" onClick={instruments.reload} className="min-h-11 underline underline-offset-4">
              Thử lại
            </button>
          </p>
        )}
        <section aria-labelledby="admin-faq-title" aria-busy={stale} className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="admin-faq-title" className="text-lg font-semibold text-bvc-ink">
                Danh sách câu hỏi{" "}
                <span className="ml-1 text-sm font-normal text-bvc-muted">
                  ({stale ? "..." : (list.data?.total ?? 0)})
                </span>
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-bvc-muted">
                Thứ tự hiển thị: số nhỏ xuất hiện trước. Các câu hỏi có thể dùng cùng một số.
              </p>
            </div>
            {(q || topic || instrumentId || status !== "ALL") && (
              <ActionButton variant="secondary" onClick={() => setSearchParams({})}>
                Xóa bộ lọc
              </ActionButton>
            )}
          </div>
          {stale ? (
            <p role="status" className="py-12 text-center text-sm text-bvc-muted">
              Đang tải câu hỏi...
            </p>
          ) : list.error ? (
            <EmptyState
              title="Chưa tải được câu hỏi"
              description={list.error}
              actions={<ActionButton onClick={list.reload}>Thử lại</ActionButton>}
            />
          ) : !list.data?.items.length ? (
            <EmptyState
              title={
                q || topic || instrumentId || status !== "ALL"
                  ? "Không tìm thấy câu hỏi phù hợp"
                  : "Chưa có câu hỏi thường gặp"
              }
              description="Thêm câu hỏi mới hoặc thử thay đổi bộ lọc."
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[16px] border border-bvc-border-strong @min-[900px]:block">
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Danh sách câu hỏi thường gặp và trạng thái hiển thị cho người học
                  </caption>
                  <colgroup>
                    <col className="w-[42%]" />
                    <col className="w-[16%]" />
                    <col className="w-[16%]" />
                    <col className="w-[9%]" />
                    <col className="w-[17%]" />
                  </colgroup>
                  <thead className="border-b border-bvc-border-strong bg-bvc-surface">
                    <tr>
                      {["Câu hỏi và trả lời", "Áp dụng", "Hiển thị", "Thứ tự", "Thao tác"].map((label) => (
                        <th key={label} scope="col" className="px-4 py-3.5 text-xs font-semibold text-bvc-muted">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bvc-border">
                    {list.data.items.map((item) => (
                      <tr key={item.id} className="align-top hover:bg-bvc-surface/30">
                        <td className="px-4 py-5">
                          <p className="mb-2 text-xs text-bvc-muted">{FAQ_TOPICS[item.topic]}</p>
                          <p className="text-[15px] leading-relaxed font-semibold break-words text-bvc-ink">
                            {item.question}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed whitespace-pre-wrap break-words text-bvc-muted">
                            <span className="font-medium">Trả lời: </span>
                            {item.answer}
                          </p>
                        </td>
                        <td className="px-4 py-5 text-sm leading-relaxed break-words text-bvc-ink">
                          {instruments.data?.find((instrument) => instrument.id === item.instrumentId)?.name ??
                            (item.instrumentId ? "Nhạc cụ cụ thể" : "Tất cả nhạc cụ")}
                        </td>
                        <td className="px-4 py-5">
                          <FaqVisibility active={item.isActive} />
                        </td>
                        <td className="px-4 py-5">
                          <span className="font-bvc-mono text-sm text-bvc-ink">{item.displayOrder}</span>
                        </td>
                        <td className="px-4 py-4">
                          <FaqActions
                            item={item}
                            disabled={Boolean(pendingId)}
                            editDisabled={Boolean(instruments.error)}
                            onEdit={() => openEditor(item)}
                            onToggle={() => void mutate(item)}
                            onDelete={() => setDeleteTarget(item)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 @min-[900px]:hidden">
                {list.data.items.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-0 rounded-[16px] border border-bvc-border-strong bg-white p-4"
                  >
                    <p className="mb-2 text-xs text-bvc-muted">Chủ đề: {FAQ_TOPICS[item.topic]}</p>
                    <h3 className="text-[16px] leading-relaxed font-semibold break-words text-bvc-ink">
                      {item.question}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed whitespace-pre-wrap break-words text-bvc-muted">
                      <span className="font-medium">Trả lời: </span>
                      {item.answer}
                    </p>
                    <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-bvc-border pt-3 text-sm">
                      <div>
                        <dt className="mb-1 text-xs text-bvc-muted">Áp dụng cho</dt>
                        <dd className="break-words text-bvc-ink">
                          {instruments.data?.find((instrument) => instrument.id === item.instrumentId)?.name ??
                            (item.instrumentId ? "Nhạc cụ cụ thể" : "Tất cả nhạc cụ")}
                        </dd>
                      </div>
                      <div className="text-right">
                        <dt className="mb-1 text-xs text-bvc-muted">Thứ tự hiển thị</dt>
                        <dd className="font-bvc-mono text-bvc-ink">{item.displayOrder}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <FaqVisibility active={item.isActive} />
                      <FaqActions
                        item={item}
                        disabled={Boolean(pendingId)}
                        editDisabled={Boolean(instruments.error)}
                        onEdit={() => openEditor(item)}
                        onToggle={() => void mutate(item)}
                        onDelete={() => setDeleteTarget(item)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
        {!stale && !list.error && list.data && (list.data.total > 20 || page > 1) && (
          <nav aria-label="Phân trang câu hỏi quản trị" className="flex flex-wrap items-center justify-between gap-3">
            <ActionButton
              variant="secondary"
              disabled={page <= 1}
              onClick={() => updateFilter("page", String(page - 1))}
            >
              <ChevronLeft size={16} aria-hidden />
              Trang trước
            </ActionButton>
            <span className="text-sm text-bvc-muted">
              Trang {page} / {pageCount}
            </span>
            <ActionButton
              variant="secondary"
              disabled={page >= pageCount}
              onClick={() => updateFilter("page", String(page + 1))}
            >
              Trang sau
              <ChevronRight size={16} aria-hidden />
            </ActionButton>
          </nav>
        )}
      </div>
      {editor && (
        <FormDialog
          open
          onClose={() => setEditor(null)}
          title={editor.item ? "Sửa câu hỏi" : "Thêm câu hỏi"}
          description="Câu hỏi phải là duy nhất trong cùng chủ đề, kể cả câu hỏi đang ẩn."
          isDirty={isDirty}
          size="lg"
        >
          {(requestClose) => (
            <FaqEditor
              item={editor.item}
              instruments={instruments.data ?? []}
              onCancel={requestClose}
              onDirtyChange={setIsDirty}
              onSaved={() => {
                setEditor(null);
                list.reload();
              }}
            />
          )}
        </FormDialog>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !pendingId) setDeleteTarget(null);
        }}
        title="Xóa vĩnh viễn câu hỏi?"
        description={
          deleteTarget
            ? `“${deleteTarget.question}” sẽ bị xóa và không thể khôi phục. Bạn có thể chọn Ẩn để giữ lại nội dung.`
            : undefined
        }
        confirmLabel="Xóa câu hỏi"
        onConfirm={() => {
          if (deleteTarget) void mutate(deleteTarget, true);
        }}
        isLoading={Boolean(pendingId)}
      />
    </TeacherScreen>
  );
}
