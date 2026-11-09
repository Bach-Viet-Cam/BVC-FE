import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { publicationReasonSchema } from "@/features/community/utils/validateVerification";
import { Music2, Search, ChevronDown } from "lucide-react";
import { verifiedApi } from "@/features/community/api/verifiedApi";
import type { VerifiedItem } from "@/features/community/types/verifiedTypes";
import { instrumentApi } from "@/features/platform/api/instrumentApi";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { AuthenticatedAudio } from "@/shared/components/bvc/AuthenticatedAudio";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { PageHero } from "@/shared/components/bvc/PageHero";
import { SectionTitle } from "@/shared/components/bvc/SectionTitle";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

const STATUS_LABELS = { VISIBLE: "Đang hiển thị", HIDDEN: "Đang ẩn", REVOKED: "Đã thu hồi" } as const;
type PublicationStatus = VerifiedItem["status"];
type MutationTarget = { item: VerifiedItem; status: PublicationStatus };

function accuracyLabel(accuracy: number | null) {
  return accuracy === null ? "Chưa có kết quả AI" : `${Number(accuracy.toFixed(1))}%`;
}

function MutationForm({
  target,
  onSaved,
  onCancel,
}: {
  target: MutationTarget;
  onSaved: (item: VerifiedItem) => void;
  onCancel: () => void;
}) {
  const schema = publicationReasonSchema(target.status === "REVOKED");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ reason: string }>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });
  const submit = handleSubmit(async ({ reason }) => {
    try {
      const item = await verifiedApi.mutate(target.item, target.status, reason || undefined);
      toast.success("Đã cập nhật bản thu xác minh.");
      onSaved(item);
    } catch (error: unknown) {
      setError("root", { message: getErrorMessage(error, "Không thể cập nhật bản thu. Vui lòng thử lại.") });
    }
  });
  return (
    <form onSubmit={submit} className="flex flex-col gap-5 px-6 pb-6 pt-3 sm:px-[30px]">
      <p className="text-sm leading-relaxed text-bvc-muted">
        {target.status === "REVOKED"
          ? "Bản thu sẽ bị gỡ khỏi học liệu. Không thể hoàn tác việc thu hồi xác minh."
          : target.status === "HIDDEN"
            ? "Bản thu sẽ không còn hiển thị cho người học. Bạn có thể cho hiển thị lại khi đáp ứng điều kiện chia sẻ."
            : "Bản thu sẽ xuất hiện dưới đúng bài nhạc và nhạc cụ để người học tham khảo."}
      </p>
      <FormField
        label="Lý do"
        htmlFor="verified-mutation-reason"
        required={target.status === "REVOKED"}
        error={errors.reason?.message}
      >
        <textarea
          id="verified-mutation-reason"
          rows={4}
          maxLength={2000}
          aria-invalid={Boolean(errors.reason)}
          className={`${INPUT_CLASSES} h-auto resize-y py-3`}
          {...register("reason")}
        />
      </FormField>
      {errors.root && (
        <p role="alert" className="text-sm text-bvc-accent-text">
          {errors.root.message}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" isLoading={isSubmitting}>
          {target.status === "REVOKED"
            ? "Thu hồi xác minh"
            : target.status === "HIDDEN"
              ? "Ẩn bản thu"
              : "Hiển thị bản thu"}
        </ActionButton>
      </div>
    </form>
  );
}

export function VerifiedContentPage() {
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<VerifiedItem | null>(null);
  const [mutation, setMutation] = useState<MutationTarget | null>(null);
  const page = Math.max(1, Number(params.get("page")) || 1);
  const query = {
    q: params.get("q") ?? "",
    cohort: params.get("cohort") ?? "",
    instrumentId: params.get("instrumentId") ?? "",
    status: params.get("status") ?? "VISIBLE",
    sortBy: params.get("sortBy") ?? "verifiedAt",
    sortDir: params.get("sortDir") ?? "desc",
    page,
  };
  const list = useAsyncData(
    () => verifiedApi.list(Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ""))),
    `verified-management:${JSON.stringify(query)}`
  );
  const instruments = useAsyncData(
    async () => (await instrumentApi.list({ status: "all", sortBy: "name", sortDir: "asc" })).data.data,
    "verified-instruments"
  );
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / (list.data?.pageSize ?? 20)));
  const update = (next: Record<string, string>) =>
    setParams((current) => {
      const values = new URLSearchParams(current);
      Object.entries(next).forEach(([key, value]) => (value ? values.set(key, value) : values.delete(key)));
      if (!("page" in next)) values.delete("page");
      return values;
    });
  const saved = (item: VerifiedItem) => {
    if (selected?.id === item.id) setSelected(item);
    setMutation(null);
    list.reload();
  };

  return (
    <TeacherScreen>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-7 px-[18px] pt-4 pb-10 md:px-8 md:pt-8">
        <PageHero title="Bản thu đã xác minh" />
        <section aria-labelledby="verified-management-heading" className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle id="verified-management-heading">Kho bản thu tham khảo</SectionTitle>
            <span aria-live="polite" className="text-sm text-bvc-muted">
              <span className="font-bvc-mono">{list.data?.total ?? 0}</span> bản thu
            </span>
          </div>
          <form
            key={params.toString()}
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              update({
                q: String(values.get("q") ?? "").trim(),
                cohort: String(values.get("cohort") ?? "").trim(),
                instrumentId: String(values.get("instrumentId") ?? ""),
                status: String(values.get("status") ?? "VISIBLE"),
                sortBy: String(values.get("sortBy") ?? "verifiedAt"),
                sortDir: String(values.get("sortDir") ?? "desc"),
              });
            }}
            className="grid gap-3 rounded-bvc-xl bg-bvc-surface p-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
              Tên bài hoặc sinh viên
              <input
                name="q"
                type="search"
                defaultValue={query.q}
                maxLength={200}
                placeholder="Tìm bản thu..."
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
              Khóa của người biểu diễn
              <input
                name="cohort"
                defaultValue={query.cohort}
                maxLength={50}
                placeholder="Tất cả khóa"
                className={INPUT_CLASSES}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
              Nhạc cụ
              <select name="instrumentId" defaultValue={query.instrumentId} className={INPUT_CLASSES}>
                <option value="">Tất cả nhạc cụ</option>
                {(instruments.data ?? []).map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
              Trạng thái
              <select name="status" defaultValue={query.status} className={INPUT_CLASSES}>
                <option value="ALL">Tất cả trạng thái</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
              Sắp xếp theo
              <select name="sortBy" defaultValue={query.sortBy} className={INPUT_CLASSES}>
                <option value="verifiedAt">Ngày xác minh</option>
                <option value="accuracy">Độ chính xác</option>
                <option value="pieceTitle">Tên bài nhạc</option>
                <option value="performer">Tên sinh viên</option>
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
              Thứ tự
              <select name="sortDir" defaultValue={query.sortDir} className={INPUT_CLASSES}>
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </label>
            <ActionButton type="submit" className="self-end">
              <Search size={16} aria-hidden /> Tìm kiếm
            </ActionButton>
          </form>
          {params.toString() && (
            <button
              type="button"
              onClick={() => setParams({})}
              className="min-h-11 self-start px-2 text-sm font-semibold text-bvc-ink underline underline-offset-4"
            >
              Xóa bộ lọc
            </button>
          )}
          {list.isLoading ? (
            <p role="status" className="py-8 text-sm text-bvc-muted">
              Đang tải nội dung xác minh...
            </p>
          ) : list.error ? (
            <EmptyState
              title="Không tải được bản thu"
              description={list.error}
              actions={<ActionButton onClick={list.reload}>Thử lại</ActionButton>}
            />
          ) : !list.data?.items.length ? (
            <EmptyState title="Chưa có bản thu phù hợp" description="Thử thay đổi bộ lọc." />
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {list.data.items.map((item) => (
                <li
                  key={item.id}
                  className="flex min-w-0 flex-col gap-4 rounded-bvc-lg border border-bvc-border bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-ink">
                      <Music2 size={20} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-[17px] font-semibold text-bvc-ink">{item.pieceTitle}</h3>
                      <p className="mt-1 break-words text-sm text-bvc-muted">
                        {item.performerDisplayName} · {item.instrument.name}
                        {item.cohort ? ` · ${item.cohort}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bvc-border pt-3">
                    <span className="inline-flex items-center gap-2 text-[13px] text-bvc-ink">
                      <span
                        className={`size-[7px] rounded-full ${item.status === "VISIBLE" ? "bg-bvc-ok" : "bg-bvc-bar-strong"}`}
                        aria-hidden
                      />
                      {STATUS_LABELS[item.status]}
                    </span>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setSelected(item)}
                      aria-label={`Mở bản thu ${item.pieceTitle} của ${item.performerDisplayName}`}
                    >
                      Mở bản thu
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <nav
            aria-label="Phân trang nội dung xác minh"
            className="flex flex-wrap items-center justify-between gap-3 pt-2"
          >
            <span className="text-sm text-bvc-muted">
              Trang{" "}
              <span className="font-bvc-mono">
                {page} / {totalPages}
              </span>
            </span>
            <div className="flex gap-2">
              <ActionButton
                variant="secondary"
                disabled={page <= 1 || list.isLoading}
                onClick={() => update({ page: String(page - 1) })}
              >
                Trước
              </ActionButton>
              <ActionButton
                variant="secondary"
                disabled={page >= totalPages || list.isLoading}
                onClick={() => update({ page: String(page + 1) })}
              >
                Sau
              </ActionButton>
            </div>
          </nav>
        </section>
      </div>
      <FormDialog
        open={Boolean(selected) && !mutation}
        onClose={() => setSelected(null)}
        title={selected?.pieceTitle ?? "Bản thu xác minh"}
        description={selected ? `${selected.performerDisplayName} · ${selected.instrument.name}` : undefined}
      >
        {selected && (
          <div className="flex min-w-0 flex-col gap-5 px-6 pt-3 pb-6 sm:px-[30px]">
            <span className="inline-flex items-center gap-2 text-[13px] text-bvc-ink">
              <span
                className={`size-[7px] rounded-full ${selected.status === "VISIBLE" ? "bg-bvc-ok" : "bg-bvc-bar-strong"}`}
                aria-hidden
              />
              {STATUS_LABELS[selected.status]}
            </span>
            <div className="rounded-bvc-lg bg-bvc-surface p-4">
              <AuthenticatedAudio
                key={`${selected.id}:${selected.version}`}
                endpoint={`/verified-contents/${selected.id}/audio`}
                label="Nghe bản thu"
              />
            </div>
            <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
              {(selected.sourceClassName || selected.cohort) && (
                <div>
                  <dt className="text-bvc-muted">Lớp / khóa</dt>
                  <dd className="mt-1 break-words font-medium">
                    {[selected.sourceClassName, selected.cohort].filter(Boolean).join(" · ")}
                  </dd>
                </div>
              )}
              {selected.accuracy !== null && (
                <div>
                  <dt className="text-bvc-muted">Độ chính xác AI</dt>
                  <dd className="mt-1 tabular-nums">{accuracyLabel(selected.accuracy)}</dd>
                </div>
              )}
              <div>
                <dt className="text-bvc-muted">Xác minh bởi</dt>
                <dd className="mt-1 break-words font-medium">{selected.verifiedByDisplayName}</dd>
              </div>
              <div>
                <dt className="text-bvc-muted">Ngày xác minh</dt>
                <dd className="mt-1">{new Date(selected.verifiedAt).toLocaleDateString("vi-VN")}</dd>
              </div>
            </dl>
            {!selected.shareConsent && (
              <p className="rounded-[14px] bg-bvc-surface p-3 text-sm leading-relaxed text-bvc-muted">
                Sinh viên chưa đồng ý chia sẻ. Bản thu không được hiển thị trong học liệu.
              </p>
            )}
            {selected.reason && (
              <p className="whitespace-pre-wrap break-words text-sm text-bvc-muted">
                Lý do cập nhật: {selected.reason}
              </p>
            )}
            <Link
              to={`/library/${selected.pieceId}/sheets/${selected.sourceSheetMusicId}`}
              className="min-h-11 self-start py-3 text-sm font-semibold text-bvc-ink underline underline-offset-4"
            >
              Xem bản nhạc
            </Link>
            <details className="group border-t border-bvc-border pt-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium text-bvc-ink [&::-webkit-details-marker]:hidden">
                Quản lý bản thu
                <ChevronDown
                  size={16}
                  aria-hidden
                  className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.canHide && (
                  <ActionButton variant="secondary" onClick={() => setMutation({ item: selected, status: "HIDDEN" })}>
                    Ẩn bản thu
                  </ActionButton>
                )}
                {selected.canShow && (
                  <ActionButton onClick={() => setMutation({ item: selected, status: "VISIBLE" })}>
                    Hiển thị bản thu
                  </ActionButton>
                )}
                {selected.canRevoke && (
                  <ActionButton variant="secondary" onClick={() => setMutation({ item: selected, status: "REVOKED" })}>
                    Thu hồi xác minh
                  </ActionButton>
                )}
                {!selected.canHide && !selected.canShow && !selected.canRevoke && (
                  <p className="text-sm text-bvc-muted">Bạn đang xem nội dung ở chế độ chỉ đọc.</p>
                )}
              </div>
            </details>
          </div>
        )}
      </FormDialog>
      <FormDialog
        open={Boolean(mutation)}
        description={mutation ? `${mutation.item.pieceTitle} · ${mutation.item.performerDisplayName}` : undefined}
        onClose={() => setMutation(null)}
        title={
          mutation?.status === "REVOKED"
            ? "Thu hồi xác minh"
            : mutation?.status === "HIDDEN"
              ? "Ẩn bản thu"
              : "Hiển thị bản thu"
        }
      >
        {mutation && (
          <MutationForm
            key={`${mutation.item.id}:${mutation.status}`}
            target={mutation}
            onSaved={saved}
            onCancel={() => setMutation(null)}
          />
        )}
      </FormDialog>
    </TeacherScreen>
  );
}
