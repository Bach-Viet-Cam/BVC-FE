import { useState } from "react";
import { audioAnalysisApi } from "@/features/practice/api/audioAnalysisApi";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { MSG } from "@/features/practice/constants/practiceConstants";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";
import { toast } from "@/shared/components/ui/toast";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export interface SegmentRange {
  start: number;
  end: number;
}

// Gửi bản thu của một đoạn: tải file lên rồi tạo lượt luyện đoạn. Lỗi thì báo toast và trả null để màn ghi âm giữ bản thu gửi lại.
export function useSegmentSubmit(submissionId: string) {
  const [uploading, setUploading] = useState(false);

  async function send(file: File, range: SegmentRange): Promise<SegmentAttempt | null> {
    if (uploading) return null;
    setUploading(true);
    try {
      const uploaded = await audioAnalysisApi.upload(file, new AbortController().signal, () => undefined);
      const created = await practiceSegmentApi.create(submissionId, {
        startSec: range.start,
        endSec: range.end,
        studentUploadId: uploaded.data.data.fileId,
      });
      toast.success(MSG.sent);
      return created.data.data;
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, MSG.submitFailed));
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { send, uploading };
}
