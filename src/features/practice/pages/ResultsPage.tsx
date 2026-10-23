import { Link, useNavigate, useParams } from "react-router-dom";
import { ChartNoAxesColumn } from "lucide-react";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M01 Kết quả phân tích: BE mới trả trạng thái bài nộp, chưa trả điểm cao độ / nhịp / tempo và danh sách lỗi theo ô nhịp.
// BarTimeline + IssueCard sẵn sàng để hiển thị khi có dữ liệu.
export function ResultsPage() {
  const navigate = useNavigate();
  const { songId = "" } = useParams();

  return (
    <PracticeFrame>
      <PracticeTopBar title="Kết quả phân tích" subtitle="Điểm chi tiết của bản thu" />

      <div className="mx-auto w-full flex-1 overflow-y-auto px-3.5 pt-2 pb-6 md:max-w-180 md:px-8 md:pt-8">
        <EmptyState
          icon={<ChartNoAxesColumn className="size-8" strokeWidth={1.5} />}
          title="Chưa có điểm chi tiết"
          description="Bản thu đã được hệ thống xử lý. Điểm cao độ, nhịp, tempo và các đoạn cần luyện lại sẽ hiện ở đây khi có kết quả."
          actions={
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={actionButtonClass("primary", "md", "hover:text-white")}
              >
                Luyện lại
              </button>
              <Link to={`/library/${songId}`} className={actionButtonClass("secondary", "md")}>
                Về trang bài hát
              </Link>
            </>
          }
        />
      </div>
    </PracticeFrame>
  );
}
