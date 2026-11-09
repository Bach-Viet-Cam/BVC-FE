import { useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type Lecturer } from "@/features/classes/types/classTypes";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { toast } from "@/shared/components/ui/toast";

export type LecturersUpdater = (current: Lecturer[]) => Lecturer[];

// Thêm/gỡ giảng viên cùng dạy; onChanged nhận hàm cập nhật để luôn tính từ danh sách mới nhất, tránh ghi đè do dữ liệu cũ
export function useClassLecturers(classId: string, onChanged: (update: LecturersUpdater) => void) {
  const [isSaving, setIsSaving] = useState(false);

  const run = async (request: () => Promise<string>) => {
    setIsSaving(true);
    try {
      toast.success(await request());
    } catch (error) {
      toast.error(parseApiError(error, "Cập nhật giảng viên thất bại. Vui lòng thử lại.").message);
    } finally {
      setIsSaving(false);
    }
  };

  const addLecturer = (lecturer: Lecturer) =>
    run(async () => {
      const { data } = await classesApi.addLecturer(classId, lecturer.id);
      onChanged((current) => [...current, data.data]);
      return data.message;
    });

  const removeLecturer = (lecturerId: string) =>
    run(async () => {
      const { data } = await classesApi.removeLecturer(classId, lecturerId);
      onChanged((current) => current.filter((item) => item.id !== lecturerId));
      return data.message;
    });

  return { addLecturer, removeLecturer, isSaving };
}
