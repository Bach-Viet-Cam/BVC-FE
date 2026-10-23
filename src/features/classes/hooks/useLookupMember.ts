import { useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type MemberLookup } from "@/features/classes/types/classTypes";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useLookupMember(classId: string) {
  const [isChecking, setIsChecking] = useState(false);

  const lookupMember = async (email: string): Promise<{ lookup: MemberLookup } | { error: ParsedApiError }> => {
    setIsChecking(true);
    try {
      const { data } = await classesApi.lookupMember(classId, email);
      return { lookup: data.data };
    } catch (error) {
      return { error: parseApiError(error, "Kiểm tra email thất bại. Vui lòng thử lại.") };
    } finally {
      setIsChecking(false);
    }
  };

  return { lookupMember, isChecking };
}
