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

// uploadUrl là URL ký sẵn (S3 hoặc storage local), không đi qua axiosClient
// vì interceptor sẽ gắn Bearer token khiến S3 từ chối chữ ký
async function putToStorage({ uploadUrl, method, headers }: PresignResult, file: File) {
  const response = await fetch(uploadUrl, { method, headers, body: file });
  if (!response.ok) throw new Error("Tải file lên thất bại. Vui lòng thử lại.");
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
