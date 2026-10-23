import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, AudioLines } from "lucide-react";
import { AudioUploadSlot } from "../components/AudioUploadSlot";
import { useAudioEvaluation } from "../hooks/useAudioEvaluation";
import type { AudioEvaluationStatus, AudioUploadResult } from "../types/audioAnalysisTypes";
import { ScoreRing } from "@/shared/components/bvc/ScoreRing";
import { ScoreBar } from "@/shared/components/bvc/ScoreBar";

const statusLabels: Record<AudioEvaluationStatus, string> = {
  publishing: "Đang gửi yêu cầu",
  published: "Đã gửi yêu cầu",
  queued: "Đang chờ xử lý",
  processing: "Đang phân tích audio",
  waiting: "Đang chờ kiểm tra chất lượng",
  completed: "Phân tích hoàn tất",
  failed: "Phân tích thất bại",
  rejected: "Bản thu không đạt chất lượng",
  publish_failed: "Gửi yêu cầu thất bại",
  publish_unknown: "Chưa xác định trạng thái gửi - đang kiểm tra lại",
};

export function AudioAnalysisTestPage() {
  const [template, setTemplate] = useState<AudioUploadResult | null>(null);
  const [student, setStudent] = useState<AudioUploadResult | null>(null);
  const onTemplate = useCallback((value: AudioUploadResult | null) => setTemplate(value), []);
  const onStudent = useCallback((value: AudioUploadResult | null) => setStudent(value), []);
  const { evaluationId, evaluation, error, submitting, polling, paused, create, resume } = useAudioEvaluation();
  const busy = submitting || polling;
  const result = evaluation?.result;
  return (
    <main className="min-h-dvh bg-bvc-surface px-5 py-10 text-bvc-ink">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="text-sm text-bvc-muted underline">
          Về bảng điều khiển
        </Link>
        <header className="mb-8 mt-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-bvc-accent">
            <AudioLines size={20} />
            Thử nghiệm · Đàn bầu
          </p>
          <h1 className="text-3xl font-bold">So sánh audio</h1>
          <p className="mt-3 max-w-2xl text-bvc-muted">
            Tải bản mẫu và bài nộp của học sinh. Mỗi file được lưu ngay khi chọn; bấm So sánh khi cả hai file đã sẵn
            sàng.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-2">
          <AudioUploadSlot
            title="Audio mẫu"
            description="Bản biểu diễn mẫu của giáo viên"
            disabled={busy}
            onChange={onTemplate}
          />
          <AudioUploadSlot
            title="Bài nộp học sinh"
            description="Bản thu cần phân tích và đối chiếu"
            disabled={busy}
            onChange={onStudent}
          />
        </div>
        <button
          type="button"
          disabled={!template || !student || busy}
          onClick={() => {
            if (template && student) void create({ templateUrl: template.url, studentUrl: student.url });
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-bvc-ink px-6 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <LoaderCircle className="animate-spin" size={18} />}
          {submitting ? "Đang gửi yêu cầu…" : polling ? "Đang chờ kết quả…" : "So sánh"}
        </button>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}
        {evaluationId && (
          <section className="mt-6 rounded-2xl border border-bvc-border bg-white p-6" aria-live="polite">
            <h2 className="text-lg font-semibold">
              {evaluation ? statusLabels[evaluation.status] : "Đang kiểm tra yêu cầu đã lưu"}
            </h2>
            <p className="mt-2 break-all font-mono text-xs text-bvc-muted">Mã yêu cầu: {evaluationId}</p>
            {evaluation?.status === "publish_failed" && (
              <p className="mt-3 text-sm text-red-700">
                Yêu cầu chưa được gửi vào hàng đợi. Bạn có thể bấm So sánh để tạo yêu cầu mới.
              </p>
            )}
            {evaluation?.error && (
              <p className="mt-3 text-sm text-red-700">
                {evaluation.error.message} ({evaluation.error.code})
              </p>
            )}
            {paused && (
              <div className="mt-4">
                <p className="text-sm text-bvc-muted">Đã tạm dừng chờ trên giao diện. Tác vụ có thể vẫn đang chạy.</p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-bvc-border px-4 py-2 text-sm"
                  onClick={resume}
                >
                  Tiếp tục kiểm tra
                </button>
              </div>
            )}
            {result && evaluation?.status === "completed" && (
              <div className="mt-6 grid items-center gap-8 md:grid-cols-[160px_1fr]">
                <ScoreRing score={result.overallScore} size={150} label="Tổng thể" />
                <div className="space-y-5">
                  <ScoreBar label="Cao độ" score={result.pitchAccuracyPercent} />
                  <ScoreBar label="Nhịp" score={result.rhythmAccuracyPercent} />
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">Nhận xét AI</h3>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-bvc-muted">
                      {result.aiFeedback || "Chưa có nhận xét."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
