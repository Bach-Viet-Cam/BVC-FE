import { z } from "zod";

export const reasonSchema = z.object({ reason: z.string().trim().min(1, "Vui lòng nhập lý do từ chối.").max(2000) });

export const publicationReasonSchema = (revoked: boolean) =>
  z
    .object({ reason: z.string().trim().max(2000, "Lý do không được vượt quá 2.000 ký tự.") })
    .refine((values) => !revoked || values.reason.length > 0, {
      path: ["reason"],
      message: "Vui lòng nhập lý do thu hồi.",
    });
