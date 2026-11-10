import ios1 from "@/assets/image/guideline/ios/1.jpg";
import ios2 from "@/assets/image/guideline/ios/2.jpg";
import ios3 from "@/assets/image/guideline/ios/3.jpg";
import ios4 from "@/assets/image/guideline/ios/4.jpg";
import ios5 from "@/assets/image/guideline/ios/5.jpg";
import ios6 from "@/assets/image/guideline/ios/6.jpg";
import chrome1 from "@/assets/image/guideline/web/chrome1.jpg";
import chrome2 from "@/assets/image/guideline/web/chrome2.jpg";
import chrome3 from "@/assets/image/guideline/web/chrome3.jpg";
import chrome4 from "@/assets/image/guideline/web/chrome4.jpg";
import chrome5 from "@/assets/image/guideline/web/chrome5.jpg";
import edge1 from "@/assets/image/guideline/web/edge1.jpg";
import edge2 from "@/assets/image/guideline/web/edge2.jpg";
import edge5 from "@/assets/image/guideline/web/edge5.jpg";
import resultWeb from "@/assets/image/guideline/web/resultweb.jpg";

export type InstallPlatform = "ios" | "chrome" | "edge";

export interface InstallStep {
  text: string;
  image: string;
  alt: string;
}

export interface InstallGuide {
  label: string;
  layout: "phone" | "desktop";
  steps: InstallStep[];
}

const DESKTOP_RESULT: InstallStep = {
  text: "Lối tắt Bách Việt Cầm xuất hiện trên màn hình máy tính và trong menu Start. Từ lần sau, bạn mở ứng dụng trực tiếp từ đây.",
  image: resultWeb,
  alt: "Biểu tượng Bách Việt Cầm trên màn hình máy tính",
};

export const INSTALL_GUIDES: Record<InstallPlatform, InstallGuide> = {
  ios: {
    label: "iPhone, iPad",
    layout: "phone",
    steps: [
      {
        text: "Mở bachvietcam.io.vn bằng Safari, nhấn nút ba chấm ở góc dưới bên phải.",
        image: ios1,
        alt: "Nút ba chấm cạnh thanh địa chỉ của Safari",
      },
      { text: "Chọn “Chia sẻ”.", image: ios2, alt: "Mục Chia sẻ trong menu của Safari" },
      {
        text: "Nhấn “Thêm” ở cuối hàng tùy chọn để xem thêm.",
        image: ios3,
        alt: "Nút Thêm trong bảng chia sẻ",
      },
      {
        text: "Chọn “Thêm vào Màn hình chính”.",
        image: ios4,
        alt: "Mục Thêm vào Màn hình chính",
      },
      {
        text: "Đổi tên ứng dụng nếu muốn, giữ bật “Mở dưới dạng ứng dụng web” rồi nhấn “Thêm”.",
        image: ios5,
        alt: "Màn hình đặt tên ứng dụng và nút Thêm",
      },
      {
        text: "Biểu tượng Bách Việt Cầm xuất hiện trên Màn hình chính. Nhấn vào để mở ứng dụng.",
        image: ios6,
        alt: "Biểu tượng Bách Việt Cầm trên Màn hình chính của iPhone",
      },
    ],
  },
  chrome: {
    label: "Google Chrome",
    layout: "desktop",
    steps: [
      {
        text: "Mở bachvietcam.io.vn, nhấn biểu tượng cài đặt ứng dụng trên thanh địa chỉ.",
        image: chrome1,
        alt: "Biểu tượng cài đặt ứng dụng trên thanh địa chỉ Chrome",
      },
      { text: "Nhấn “Tiếp theo”.", image: chrome2, alt: "Hộp thoại Cài đặt ứng dụng với nút Tiếp theo" },
      {
        text: "Nhấn “Cài đặt”. Giữ chọn “Thêm lối tắt trên màn hình” để có biểu tượng ngoài màn hình máy tính.",
        image: chrome3,
        alt: "Hộp thoại Cài đặt ứng dụng với nút Cài đặt",
      },
      { text: "Chờ vài giây để Chrome cài đặt.", image: chrome4, alt: "Thanh tiến trình đang cài đặt ứng dụng" },
      {
        text: "Nhấn “Mở thẻ trong ứng dụng” để chuyển sang cửa sổ ứng dụng.",
        image: chrome5,
        alt: "Thông báo đã cài đặt thành công",
      },
      DESKTOP_RESULT,
    ],
  },
  edge: {
    label: "Microsoft Edge",
    layout: "desktop",
    steps: [
      {
        text: "Mở bachvietcam.io.vn, nhấn biểu tượng cài đặt ứng dụng trên thanh địa chỉ.",
        image: edge1,
        alt: "Biểu tượng cài đặt ứng dụng trên thanh địa chỉ Edge",
      },
      {
        text: "Nhấn “Install”. Edge cài ứng dụng ngay, không cần thêm bước nào.",
        image: edge2,
        alt: "Hộp thoại Install Bách Việt Cầm app",
      },
      {
        text: "Ứng dụng tự mở trong cửa sổ riêng. Chọn nơi muốn ghim (thanh tác vụ, menu Start, màn hình) rồi nhấn “Allow”.",
        image: edge5,
        alt: "Cửa sổ ứng dụng với thông báo App installed",
      },
      DESKTOP_RESULT,
    ],
  },
};

export const INSTALL_PLATFORMS: InstallPlatform[] = ["ios", "chrome", "edge"];

export function detectInstallPlatform(userAgent: string, maxTouchPoints: number): InstallPlatform {
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return "ios";
  if (/Edg\//.test(userAgent)) return "edge";
  return "chrome";
}
