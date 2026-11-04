export interface VerifiedItem {
  id: string;
  submissionId: string;
  pieceId: string;
  pieceTitle: string;
  sourceSheetMusicId: string;
  instrument: { id: string; name: string };
  performerDisplayName: string;
  cohort: string;
  sourceClassName: string;
  accuracy: number | null;
  tempoDeviation: number | null;
  verifiedByDisplayName: string;
  verifiedAt: string;
  status: "VISIBLE" | "HIDDEN" | "REVOKED";
  version: number;
  reason: string | null;
  shareConsent: boolean;
  canHide: boolean;
  canShow: boolean;
  canRevoke: boolean;
}
export interface VerifiedList {
  items: VerifiedItem[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ReviewState {
  review: { status: "APPROVED" | "REJECTED"; reviewedAt: string; reason: string | null } | null;
  shareConsent: boolean;
  canReview: boolean;
  verifiedContentId: string | null;
}
