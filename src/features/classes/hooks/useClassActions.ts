import { useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type ClassDetail } from "@/features/classes/types/classTypes";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

type ActionResult<T> = { data: T; message: string } | { error: string };

export function useClassActions(classId: string) {
  const [isWorking, setIsWorking] = useState(false);

  const run = async <T>(
    request: () => Promise<{ data: { data: T; message: string } }>,
    fallback: string
  ): Promise<ActionResult<T>> => {
    setIsWorking(true);
    try {
      const { data } = await request();
      return { data: data.data, message: data.message };
    } catch (error) {
      return { error: parseApiError(error, fallback).message };
    } finally {
      setIsWorking(false);
    }
  };

  const endClass = () =>
    run<ClassDetail>(() => classesApi.endClass(classId), "Kết thúc lớp thất bại. Vui lòng thử lại.");
  const removeMember = (studentId: string) =>
    run<null>(() => classesApi.removeMember(classId, studentId), "Xóa sinh viên thất bại. Vui lòng thử lại.");

  return { endClass, removeMember, isWorking };
}
