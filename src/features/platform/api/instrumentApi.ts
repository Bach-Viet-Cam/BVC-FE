import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type InstrumentCreateRequest,
  type InstrumentItem,
  type InstrumentListParams,
  type InstrumentTune,
  type InstrumentTuneInput,
  type InstrumentUpdateRequest,
} from "@/features/platform/types/configTypes";

export const instrumentApi = {
  list: (params: InstrumentListParams) => axiosClient.get<ApiResponse<InstrumentItem[]>>("/instruments", { params }),
  create: (body: InstrumentCreateRequest) => axiosClient.post<ApiResponse<InstrumentItem>>("/instruments", body),
  update: (id: string, body: InstrumentUpdateRequest) =>
    axiosClient.patch<ApiResponse<InstrumentItem>>(`/instruments/${id}`, body),
  activate: (id: string) => axiosClient.post<ApiResponse<InstrumentItem>>(`/instruments/${id}/activate`),
  deactivate: (id: string) => axiosClient.post<ApiResponse<InstrumentItem>>(`/instruments/${id}/deactivate`),
  getTunes: (id: string) => axiosClient.get<ApiResponse<InstrumentTune[]>>(`/instruments/${id}/tunes`),
  setTunes: (id: string, tunes: InstrumentTuneInput[]) =>
    axiosClient.put<ApiResponse<InstrumentTune[]>>(`/instruments/${id}/tunes`, { tunes }),
};

