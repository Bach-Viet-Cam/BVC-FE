import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import type { Moderation } from "@/features/music-library/types/lecturerTypes";

export function pieceLockMessage(moderation: Moderation): string {
  return moderation === "ADMIN_HIDDEN" ? LIBRARY_MESSAGES.lockedByAdmin : LIBRARY_MESSAGES.lockedByOwner;
}
