import { useState } from "react";
import { AddStudentForm } from "@/features/classes/components/AddStudentForm";
import { useAddStudent } from "@/features/classes/hooks/useAddStudent";
import { useLookupMember } from "@/features/classes/hooks/useLookupMember";
import { type ApiFieldError, type ClassDetail, type MemberLookup } from "@/features/classes/types/classTypes";
import { type StudentFormValues } from "@/features/classes/utils/validateStudent";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { toast } from "@/shared/components/ui/toast";

interface AddStudentDialogProps {
  open: boolean;
  classDetail: ClassDetail;
  onClose: () => void;
  onAdded: () => void;
}

export function AddStudentDialog({ open, classDetail, onClose, onAdded }: AddStudentDialogProps) {
  const { addStudent, isSaving } = useAddStudent(classDetail.id);
  const { lookupMember, isChecking } = useLookupMember(classDetail.id);
  const [isDirty, setIsDirty] = useState(false);

  const close = () => {
    setIsDirty(false);
    onClose();
  };

  const handleLookup = async (email: string): Promise<MemberLookup | ApiFieldError[] | null> => {
    const result = await lookupMember(email);
    if ("lookup" in result) return result.lookup;
    if (result.error.fieldErrors.length > 0) return result.error.fieldErrors;
    toast.error(result.error.message);
    return null;
  };

  const handleSubmit = async (values: StudentFormValues): Promise<ApiFieldError[] | null> => {
    const result = await addStudent(values);
    if ("message" in result) {
      toast.success(result.message);
      onAdded();
      close();
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  return (
    <FormDialog
      open={open}
      onClose={close}
      title="Thêm sinh viên"
      description={`${classDetail.name} · ${classDetail.cohort}`}
      isDirty={isDirty}
    >
      {(requestClose) => (
        <AddStudentForm
          isSaving={isSaving}
          isChecking={isChecking}
          onCancel={requestClose}
          onLookup={handleLookup}
          onSubmit={handleSubmit}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
