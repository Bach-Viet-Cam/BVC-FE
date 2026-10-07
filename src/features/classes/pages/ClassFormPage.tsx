import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Music } from "lucide-react";

const STUDENT_PREVIEW = [
  { msv: "SE180001", name: "Trần Minh Anh", email: "anhtm@fpt.edu.vn" },
  { msv: "SE180002", name: "Lê Quốc Bảo", email: "baoql@fpt.edu.vn" },
  { msv: "SE180003", name: "Nguyễn Phương Linh", email: "linhnp@fpt.edu.vn" },
];

export function ClassFormPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-[32px] py-5">
        <button
          type="button"
          onClick={() => navigate("/teacher/classes")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            M03 · Lớp học
          </span>
          <span className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Tạo lớp học
          </span>
        </div>

        <div className="ml-auto flex items-center gap-[10px]">
          <button
            type="button"
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
          >
            Tạo lớp
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px]">
          <div className="flex flex-col gap-[20px] rounded-[20px] border border-bvc-border bg-white p-[20px]">
            <span className="text-[15px] font-bold text-bvc-ink">Thông tin lớp học</span>

            {/* Mã lớp */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Mã lớp</label>
              <input
                type="text"
                placeholder="TRD301"
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong px-4 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink"
              />
            </div>

            {/* Tên môn học */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Tên môn học</label>
              <input
                type="text"
                placeholder="Nhạc cụ truyền thống"
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong px-4 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink"
              />
            </div>

            {/* Học kỳ */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Học kỳ</label>
              <select className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong px-4 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink bg-white">
                <option>Fall 2026</option>
                <option>Spring 2027</option>
                <option>Fall 2027</option>
              </select>
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Mô tả</label>
              <textarea
                className="min-h-[72px] w-full rounded-[14px] border border-bvc-border-strong px-4 py-3 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink resize-none"
                placeholder="Mô tả nội dung lớp học..."
              />
            </div>

            {/* Ngày bắt đầu + Số tuần */}
            <div className="grid grid-cols-2 gap-[14px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong px-4 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Số tuần</label>
                <input
                  type="number"
                  defaultValue={6}
                  min={1}
                  max={16}
                  className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong px-4 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink"
                />
              </div>
            </div>

            {/* Giảng viên phụ trách */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-semibold text-bvc-muted mb-1.5">Giảng viên phụ trách</label>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email"
                className="h-[46px] w-full rounded-[14px] border border-bvc-border-strong px-4 text-[14px] text-bvc-ink focus:outline-none focus:border-bvc-ink"
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <aside className="flex w-[380px] shrink-0 flex-col gap-[20px] overflow-y-auto border-l border-bvc-border-strong bg-bvc-surface p-[22px_20px]">
          {/* CSV Import card */}
          <div className="flex flex-col gap-[14px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
            <span className="text-[15px] font-bold text-bvc-ink">Danh sách sinh viên</span>

            {/* Upload zone */}
            <div className="flex cursor-pointer flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-bvc-border-strong bg-bvc-surface p-[20px]">
              <Upload size={24} className="text-bvc-muted" />
              <span className="text-[14px] font-semibold text-bvc-ink">Tải lên file CSV</span>
              <span className="text-[12px] text-bvc-muted">MSSV, Họ tên, Email</span>
            </div>

            {/* Preview rows */}
            <div className="flex flex-col">
              {STUDENT_PREVIEW.map((s) => (
                <div
                  key={s.msv}
                  className="flex items-center h-[40px] border-b border-bvc-line last:border-0 text-[13px] text-bvc-ink"
                >
                  {s.msv} · {s.name} · {s.email}
                </div>
              ))}
            </div>

            {/* Warning row */}
            <div className="rounded-[10px] bg-bvc-accent-tint px-3 py-2 text-[12px] text-bvc-accent-text">
              Dòng 4: Thiếu email — bỏ qua
            </div>
          </div>

          {/* Lưu ý card */}
          <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
            <span className="text-[14px] font-bold text-bvc-ink">Lưu ý</span>
            <ul className="flex flex-col gap-[8px]">
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <Music size={14} className="mt-[2px] shrink-0 text-bvc-muted" />
                Mã lớp không thể thay đổi sau khi tạo
              </li>
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <Music size={14} className="mt-[2px] shrink-0 text-bvc-muted" />
                Sinh viên có thể được thêm/xóa sau
              </li>
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <Music size={14} className="mt-[2px] shrink-0 text-bvc-muted" />
                Lộ trình 6 tuần được tạo tự động
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
