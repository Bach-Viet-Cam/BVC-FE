import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { RoadmapWeekEditor } from "@/features/classes/components/RoadmapWeekEditor";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type RoadmapVersion, type SaveRoadmapPayload } from "@/features/classes/types/roadmapTypes";
import { formatDateTime } from "@/shared/utils/formatDate";
import {
  roadmapFormSchema,
  type RoadmapFormValues,
  toRoadmapFormPath,
  toRoadmapFormValues,
  toSaveRoadmapPayload,
} from "@/features/classes/utils/validateRoadmap";

interface RoadmapEditorProps {
  roadmap: RoadmapVersion;
  isSaving: boolean;
  onSave: (payload: SaveRoadmapPayload) => Promise<ApiFieldError[] | null>;
}

// Parent re-mounts this with a key per instrument/version, so switching instrument discards edits (spec §5.1).
export function RoadmapEditor({ roadmap, isSaving, onSave }: RoadmapEditorProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: toRoadmapFormValues(roadmap),
  });

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSave(toSaveRoadmapPayload(values));
    for (const fieldError of fieldErrors ?? []) {
      const path = toRoadmapFormPath(fieldError.field);
      // "as never": the path is built from the server field and matches a RoadmapFormValues path by construction.
      if (path) setError(path as never, { type: "server", message: fieldError.message });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-[14px]">
      <section className="flex flex-col gap-[6px] rounded-[18px] border border-bvc-border p-[16px]">
        <h2 className="m-0 text-[18px] font-extrabold tracking-[-0.01em]">{roadmap.instrument.name}</h2>
        <span className="text-[13.5px] text-bvc-muted">
          {roadmap.isTemplate || roadmap.version === null
            ? "Chưa có lộ trình · khởi tạo từ khung chuẩn"
            : `Phiên bản hiện tại v${roadmap.version} · ${roadmap.createdAt ? formatDateTime(roadmap.createdAt) : ""}`}
        </span>
        <span className="text-[12.5px] text-bvc-muted">
          Lưu sẽ tạo phiên bản mới. Lớp đang dùng phiên bản cũ giữ nguyên.
        </span>
      </section>
      <div className="grid gap-[14px] xl:grid-cols-2">
        {roadmap.weeks.map((week, index) => (
          <RoadmapWeekEditor
            key={week.weekNumber}
            weekIndex={index}
            instrumentId={roadmap.instrument.id}
            control={control}
            register={register}
            errors={errors}
          />
        ))}
      </div>
      <div className="sticky bottom-0 flex justify-end gap-[10px] border-t border-bvc-border bg-white py-[12px]">
        <ActionButton
          size="lg"
          className="max-w-[180px]"
          disabled={isSaving}
          onClick={() => reset(toRoadmapFormValues(roadmap))}
        >
          Hủy
        </ActionButton>
        <ActionButton size="lg" variant="primary" type="submit" className="max-w-[180px]" disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu"}
        </ActionButton>
      </div>
    </form>
  );
}
