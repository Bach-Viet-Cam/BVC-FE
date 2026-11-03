# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Ứng dụng web (React + Vite), **ưu tiên mobile**: thiết kế cho màn hình điện thoại trước, sau đó mở rộng lên tablet/desktop.

## Users

- **Sinh viên** của một trường/khoa âm nhạc, học **nhạc cụ dân tộc Việt Nam**. Họ tự luyện tập ngoài giờ lên lớp, thường một mình, với điện thoại đặt cạnh và hai tay đang cầm nhạc cụ.
- **Giảng viên** của cùng cơ sở đào tạo: mở lớp, giao lộ trình và bài tập, chấm và xác minh bài nộp của sinh viên.

## Product Purpose

Bách Việt Cầm là nền tảng học nhạc cụ dân tộc nội bộ cho một trường/khoa nhạc. Nó nối buổi tự luyện của sinh viên với lớp học của giảng viên:

- Sinh viên tự luyện, thu âm, nhận phản hồi về cao độ và nhịp, làm bài tập được giao, và tham gia hoà tấu.
- Giảng viên mở lớp, giao lộ trình/bài tập, chấm và xác minh bài nộp.

Thành công nghĩa là sinh viên luyện tập đều đặn với phản hồi cụ thể giữa các buổi học, và giảng viên thấy được tiến bộ thật của từng người.

## Positioning

Phản hồi cao độ/nhịp tự động dành riêng cho nhạc cụ dân tộc Việt Nam, gắn trực tiếp vào lớp học, lộ trình và bài tập của chính giảng viên trong trường, chứ không phải một app học nhạc đại trà.

## Operating Context

- Luyện tập: sinh viên thu âm khi tay còn cầm nhạc cụ, nên thao tác phải nhanh và vùng chạm lớn.
- Lớp học: lộ trình, bài tập, bài nộp, chấm điểm do giảng viên điều phối.
- Cộng đồng: bài nộp, nội dung đã xác minh, bảng xếp hạng, thử thách, điểm thưởng.
- Hoà tấu: phiên luyện tập chung, bảng mixer, phân tích tempo/timing, phát lại.
- Thư viện nhạc: bài, bản nhạc (sheet), khám phá, phân loại.

## Capabilities and Constraints

- Giao diện hoàn toàn **tiếng Việt**.
- Các mô-đun (theo `../docs/modules-bvc-fe.md`): M02 Thư viện nhạc, M03 Lớp học, M04 Cộng đồng, M05 Hoà tấu, M06 Nền tảng (người dùng, cấu hình, danh mục, thông báo, trung tâm trợ giúp). **Mô-đun cho thuê nhạc cụ (M06-07) bị loại khỏi phạm vi.**
- Vai trò được phân quyền định tuyến: Sinh viên, Giảng viên (và quản trị nền tảng cho M06).
- Phân tích cao độ chạy trên trình duyệt (`pitchy`); thu âm qua micro thiết bị.
- Quy ước code ràng buộc: `docs/RULES.md`, `docs/STRUCTURE.md`.

## Brand Commitments

- Tên: **Bách Việt Cầm** (tên miền/kỹ thuật: BachVietCam).
- Logo: `src/assets/image/logo.png`.
- Hệ thống thiết kế hiện có được ghi tại `docs/DESIGN.md`.

## Evidence on Hand

- Ảnh: `src/assets/image/` (logo, ảnh sinh viên, artboard).
- Chưa xác nhận có lời chứng thực, số liệu sử dụng, hay tên giảng viên/sinh viên thật để dùng công khai. Không được bịa ra.

## Product Principles

1. **Luyện tập là trung tâm.** Mọi màn hình của sinh viên phục vụ việc quay lại cây đàn nhanh hơn, không phải ở lâu hơn trên app.
2. **Phản hồi phải cụ thể và đọc được ngay**: chỉ ra đoạn nào sai, sai bao nhiêu, thay vì điểm số chung chung.
3. **Giảng viên vẫn là người quyết định.** Phân tích tự động hỗ trợ việc chấm và xác minh, không thay thế đánh giá của giảng viên.
4. **Tôn trọng nhạc cụ dân tộc**: thuật ngữ, cách gọi và đặc thù kỹ thuật của từng nhạc cụ Việt Nam phải đúng.
5. **Mobile trước, một tay, giữa buổi tập.**

## Accessibility & Inclusion

- Vùng chạm tối thiểu 44 px; điều khiển thu âm lớn hơn vì người dùng bấm khi đang cầm nhạc cụ.
- Chữ tiếng Việt có dấu phải hiển thị đúng ở mọi cỡ chữ.
