import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { AssignmentContentFields } from "@/features/classes/components/AssignmentContentFields";
import { useClassSheetMusic } from "@/features/classes/hooks/useClassSheetMusic";
import { type CopyAssignmentRow } from "@/features/classes/types/classTypes";
import {
  type AssignmentContentPayload,
  type AssignmentSheetMusic,
} from "@/features/classes/types/teacherAssignmentTypes";
import { assignmentFormSchema, toAssignmentContent } from "@/features/classes/utils/validateAssignment";

const copyEditSchema = assignmentFormSchema.omit({ classId: true });
type CopyEditValues = z.infer<typeof copyEditSchema>;

interface CopyAssignmentEditDialogProps {
  row: CopyAssignmentRow | null;
  instrumentId: string;
  onClose: () => void;
  onApply: (content: AssignmentContentPayload, sheetMusic: AssignmentSheetMusic | null) => void;
}

interface EditContentProps {
  row: CopyAssignmentRow;
  instrumentId: string;
  onCancel: () => void;
  onApply: CopyAssignmentEditDialogProps["onApply"];
}

function EditContent({ row, instrumentId, onCancel, onApply }: EditContentProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CopyEditValues>({
    resolver: zodResolver(copyEditSchema),
    defaultValues: {
      maxSubmissions: row.content.maxSubmissions == null ? "" : String(row.content.maxSubmissions),
      title: row.content.title,
      kind: row.content.kind,
      description: row.content.description ?? "",
      sheetMusicId: row.content.sheetMusicId ?? "",
      requiredBpm: row.content.requiredBpm === null ? "" : String(row.content.requiredBpm),
    },
  });
  const sheetMusicId = useWatch({ control, name: "sheetMusicId" });
  const title = useWatch({ control, name: "title" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const { sheets } = useClassSheetMusic({ instrumentId });

  const apply = handleSubmit((values) => {
    const content = toAssignmentContent({ classId: "", ...values });
    let sheetMusic: AssignmentSheetMusic | null = null;
    if (content.sheetMusicId) {
      const sheet = sheets.find((item) => item.id === content.sheetMusicId);
      if (sheet) sheetMusic = { ...sheet, isAvailable: true };
      else if (row.sheetMusic?.id === content.sheetMusicId) sheetMusic = row.sheetMusic;
    }
    onApply(content, sheetMusic);
  });

  return (
    <form onSubmit={apply} noValidate className="flex grow flex-col">
      <FormBody>
        <AssignmentContentFields
          register={register}
          errors={errors}
          title={title}
          description={description}
          sheetMusicId={sheetMusicId}
          sheets={sheets}
          currentSheetMusic={row.sheetMusic}
          idPrefix="copy-assignment"
        />
      </FormBody>
      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel}>
          Hủy
        </ActionButton>
        <ActionButton variant="primary" type="submit">
          Áp dụng
        </ActionButton>
      </FormFooter>
    </form>
  );
}

export function CopyAssignmentEditDialog({ row, instrumentId, onClose, onApply }: CopyAssignmentEditDialogProps) {
  return (
    <FormDialog
      open={row !== null}
      onClose={onClose}
      title="Sửa bài tập"
      description="Thay đổi chỉ áp dụng cho bài sao chép vào lớp mới."
    >
      {(requestClose) =>
        row && (
          <EditContent key={row.key} row={row} instrumentId={instrumentId} onCancel={requestClose} onApply={onApply} />
        )
      }
    </FormDialog>
  );
}
