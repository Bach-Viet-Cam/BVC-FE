import { AuthenticatedAudio } from "@/shared/components/bvc/AuthenticatedAudio";

interface ResultAudioPlayersProps {
  submissionId: string;
  teacherUrl: string | null;
}

// Nghe lại bản mẫu của giảng viên và bản thu của sinh viên, đặt ngay dưới biểu đồ cao độ để vừa xem vừa nghe.
// Bấm phát một bên thì bên kia tự dừng.
export function ResultAudioPlayers({ submissionId, teacherUrl }: ResultAudioPlayersProps) {
  return (
    <section
      aria-label="Nghe lại"
      className="flex flex-col gap-3.5 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5"
    >
      <h2 className="text-sm font-semibold text-bvc-ink">Nghe lại</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-bvc-muted">
            <span className="h-1.5 w-3.5 rounded-full bg-bvc-ink" />
            Bản mẫu giảng viên
          </span>
          {teacherUrl ? (
            <audio
              aria-label="Nghe bản mẫu giảng viên"
              controls
              preload="none"
              src={teacherUrl}
              onPlay={(event) => {
                document.querySelectorAll("audio").forEach((audio) => {
                  if (audio !== event.currentTarget) audio.pause();
                });
              }}
              className="w-full"
            >
              Trình duyệt không hỗ trợ phát audio.
            </audio>
          ) : (
            <p className="text-[13px] text-bvc-muted">Bài này chưa có bản mẫu để nghe.</p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-bvc-muted">
            <span className="h-1 w-3.5 rounded-full bg-[#dc2626]" />
            Bản thu của bạn
          </span>
          <AuthenticatedAudio
            key={submissionId}
            endpoint={`/submissions/${submissionId}/audio`}
            label="Nghe lại bản thu"
          />
        </div>
      </div>
    </section>
  );
}
