import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Layers } from "lucide-react";

const SECTIONS = [
  {
    label: "Auth",
    color: "#6E6A64",
    routes: [
      { label: "Đăng nhập", path: "/login" },
      { label: "Đăng ký", path: "/register" },
      { label: "Quên mật khẩu", path: "/forgot" },
    ],
  },
  {
    label: "Home",
    color: "#2E7D4F",
    routes: [
      { label: "Trang chủ", path: "/home" },
      { label: "Hồ sơ", path: "/profile" },
    ],
  },
  {
    label: "Practice",
    color: "#F4622E",
    routes: [
      { label: "Phòng luyện", path: "/practice/ly-ngua-o" },
      { label: "Kiểm tra mic", path: "/practice/ly-ngua-o/quality" },
      { label: "Chọn chế độ", path: "/practice/ly-ngua-o/modes" },
      { label: "Máy đo cao độ", path: "/practice/ly-ngua-o/tuner" },
      { label: "Máy đánh nhịp", path: "/practice/ly-ngua-o/metronome" },
      { label: "Đang thu âm", path: "/practice/ly-ngua-o/recording" },
      { label: "Kết quả", path: "/practice/ly-ngua-o/analysis/rec-3" },
      { label: "Chi tiết lỗi", path: "/practice/ly-ngua-o/error/err-1" },
      { label: "Luyện đoạn", path: "/practice/ly-ngua-o/section" },
      { label: "So sánh", path: "/practice/ly-ngua-o/compare" },
      { label: "Lịch sử", path: "/practice/ly-ngua-o/history" },
      { label: "Phân tích bài", path: "/practice/ly-ngua-o/song-analysis" },
    ],
  },
  {
    label: "Thư viện",
    color: "#A07010",
    routes: [
      { label: "Thư viện", path: "/library" },
      { label: "Chi tiết bài", path: "/library/ly-ngua-o" },
      { label: "Bản nhạc", path: "/library/ly-ngua-o/sheet" },
      { label: "Đã lưu", path: "/saved" },
      { label: "Tải lên", path: "/library/upload" },
    ],
  },
  {
    label: "Bài tập",
    color: "#1A6BAA",
    routes: [
      { label: "Bài tập của tôi", path: "/assignments" },
      { label: "Chi tiết bài tập", path: "/assignment/asgn-1" },
    ],
  },
  {
    label: "Hòa tấu & Thuê",
    color: "#6B4FA8",
    routes: [
      { label: "Hòa tấu", path: "/ensemble/session-1" },
      { label: "Ghép bè (playback)", path: "/ensemble/session-1/playback" },
      { label: "Chợ thuê nhạc cụ", path: "/rental/marketplace" },
      { label: "Thuê nhạc cụ", path: "/rental" },
    ],
  },
  {
    label: "Thông báo & Hỗ trợ",
    color: "#2E7D4F",
    routes: [
      { label: "Thông báo", path: "/notifications" },
      { label: "Trợ lý hỗ trợ", path: "/help" },
    ],
  },
  {
    label: "Desktop — GV",
    color: "#1A1714",
    routes: [
      { label: "Trang chủ GV", path: "/teacher/home" },
      { label: "Bảng điều khiển lớp", path: "/teacher" },
      { label: "Danh sách lớp", path: "/teacher/classes" },
      { label: "Tạo lớp học", path: "/teacher/classes/new" },
      { label: "Phân công bè", path: "/teacher/classes/trd301/assign" },
      { label: "Lộ trình 6 tuần", path: "/teacher/roadmap" },
      { label: "Danh sách bài tập", path: "/teacher/assignments" },
      { label: "Duyệt bài nộp", path: "/teacher/review" },
      { label: "Tạo bài tập", path: "/teacher/assignments/new" },
      { label: "Review sinh viên", path: "/teacher/student-review" },
    ],
  },
  {
    label: "Desktop — Thư viện",
    color: "#1A1714",
    routes: [
      { label: "Quản lý bài nhạc", path: "/songs" },
      { label: "Tạo/Sửa bài nhạc", path: "/songs/new" },
      { label: "Quản lý bản nhạc", path: "/songs/sheets" },
      { label: "Phân loại nội dung", path: "/categories" },
    ],
  },
  {
    label: "Desktop — Admin",
    color: "#1A1714",
    routes: [
      { label: "Tổng quan hệ thống", path: "/admin" },
      { label: "Quản lý người dùng", path: "/admin/users" },
      { label: "Cấu hình hệ thống", path: "/admin/config" },
      { label: "Phân loại (Admin)", path: "/admin/categories" },
      { label: "Giám sát hệ thống", path: "/admin/monitoring" },
      { label: "Quản lý thông báo", path: "/admin/notifications" },
      { label: "Duyệt nội dung", path: "/community/approval" },
      { label: "Cho thuê (provider)", path: "/rental/provider" },
    ],
  },
  {
    label: "Community (M04)",
    color: "#6B4FA8",
    routes: [
      { label: "Bonus Assignments", path: "/community/bonus" },
      { label: "Chi tiết Bonus", path: "/community/bonus/b1" },
      { label: "Nộp Bonus", path: "/community/bonus/b1/submit" },
      { label: "Bảng xếp hạng", path: "/community/leaderboard" },
      { label: "Challenges", path: "/community/challenges" },
      { label: "Chi tiết Challenge", path: "/community/challenges/c1" },
      { label: "Tạo Bonus (Desktop)", path: "/community/bonus/new" },
      { label: "Nội dung Verified", path: "/community/verified" },
      { label: "Tạo Challenge (Desktop)", path: "/community/challenges/new" },
    ],
  },
];

export function DevNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Dev Navigation"
        style={{
          position: "fixed",
          top: "50%",
          left: open ? 252 : 0,
          transform: "translateY(-50%)",
          zIndex: 9999,
          width: 28,
          height: 56,
          background: "#1A1714",
          color: "#fff",
          border: "none",
          borderRadius: "0 10px 10px 0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "left 0.25s ease",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : -252,
          width: 252,
          height: "100vh",
          zIndex: 9998,
          background: "#fff",
          borderRight: "1px solid #E0DDD9",
          display: "flex",
          flexDirection: "column",
          transition: "left 0.25s ease",
          boxShadow: open ? "4px 0 16px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid #EBE9E6", display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={16} color="#F4622E" />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em", color: "#1A1714" }}>Dev Navigator</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#A09B94", fontFamily: "monospace" }}>
            {SECTIONS.reduce((a, s) => a + s.routes.length, 0)} màn
          </span>
        </div>

        {/* Current path */}
        <div style={{ padding: "6px 14px", borderBottom: "1px solid #F2F1EF", background: "#F7F5F3" }}>
          <span style={{ fontSize: 11, color: "#6E6A64", fontFamily: "monospace" }}>{location.pathname}</span>
        </div>

        {/* Sections */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div style={{
                padding: "6px 14px 3px",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: section.color,
              }}>
                {section.label}
              </div>
              {section.routes.map((route) => {
                const isActive = location.pathname === route.path;
                return (
                  <button
                    key={route.path}
                    type="button"
                    onClick={() => { navigate(route.path); setOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "7px 14px",
                      background: isActive ? "#FEEEE7" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      borderLeft: isActive ? "3px solid #F4622E" : "3px solid transparent",
                    }}
                  >
                    <span style={{
                      fontSize: 13,
                      color: isActive ? "#C4431A" : "#1A1714",
                      fontWeight: isActive ? 700 : 400,
                    }}>
                      {route.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#A09B94", fontFamily: "monospace" }}>
                      {route.path.length > 22 ? "…" + route.path.slice(-16) : route.path}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid #EBE9E6", fontSize: 11, color: "#A09B94" }}>
          Dev only — không hiện khi build
        </div>
      </div>
    </>
  );
}
