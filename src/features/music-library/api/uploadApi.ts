import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type {
  PresignRequest,
  PresignResult,
  StoredFile,
  UploadKind,
} from "@/features/music-library/types/lecturerTypes";

export const uploadApi = {
  presign: (body: PresignRequest) => axiosClient.post<ApiResponse<PresignResult>>("/uploads/presign", body),
  confirm: (fileId: string) => axiosClient.post<ApiResponse<StoredFile>>(`/uploads/${fileId}/confirm`),
};

// uploadUrl là API của BE (không ký sẵn), cần Bearer token nên đi qua axiosClient.
// timeout 0: file video lớn có thể mất hơn 10 giây mặc định
async function putToStorage({ uploadUrl, method, headers }: PresignResult, file: File) {
  await axiosClient.request({ url: uploadUrl, method, headers, data: file, timeout: 0 });
}

// presign → PUT file → confirm; trả file đã được server kiểm tra
export async function uploadMediaFile(kind: UploadKind, file: File): Promise<StoredFile> {
  const { data: presigned } = await uploadApi.presign({
    kind,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  });
  await putToStorage(presigned.data, file);
  const { data: confirmed } = await uploadApi.confirm(presigned.data.fileId);
  return confirmed.data;
}
