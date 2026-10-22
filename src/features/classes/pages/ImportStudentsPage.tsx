import { useNavigate, useParams } from "react-router-dom";
import { ClassWriteGuard } from "@/features/classes/components/ClassWriteGuard";
import { ImportStudentsPanel } from "@/features/classes/components/ImportStudentsPanel";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { useImportStudents } from "@/features/classes/hooks/useImportStudents";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { toast } from "@/shared/components/ui/toast";

export function ImportStudentsPage() {
  const navigate = useNavigate();
  const { classId = "" } = useParams<{ classId: string }>();
  const { classDetail, isLoading, error, reload } = useClassDetail(classId);
  const importer = useImportStudents(classId);
  const backPath = `/teacher/classes/${classId}`;

  const leave = () => {
    importer.cancel();
    navigate(backPath);
  };

  const confirmImport = async () => {
    const outcome = await importer.confirm();
    if ("error" in outcome) {
      toast.error(outcome.error);
      return;
    }
    toast.success(outcome.message);
    navigate(backPath);
  };

  const downloadTemplate = async () => {
    const downloadError = await importer.downloadTemplate();
    if (downloadError) toast.error(downloadError);
  };

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title="Nhập danh sách SV"
        subtitle={
          classDetail ? `${classDetail.name} · ${classDetail.cohort} · ${classDetail.instrument.name}` : undefined
        }
        onBack={leave}
      />
      <ClassWriteGuard
        classDetail={classDetail}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        blockedMessage="Không thể nhập danh sách vì lớp đã kết thúc."
      >
        {() => (
          <ImportStudentsPanel
            phase={importer.phase}
            fileName={importer.fileName}
            fileError={importer.fileError}
            preview={importer.preview}
            onSelectFile={importer.selectFile}
            onDownloadTemplate={downloadTemplate}
            onCancel={leave}
            onConfirm={confirmImport}
          />
        )}
      </ClassWriteGuard>
    </TeacherScreen>
  );
}
