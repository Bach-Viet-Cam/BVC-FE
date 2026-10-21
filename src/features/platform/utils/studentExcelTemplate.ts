import * as XLSX from "xlsx";
import { IMPORT_MAX_ROWS, IMPORT_TEMPLATE_FILE_NAME } from "@/features/platform/constants/userImportConstants";
import { COLUMN_LABELS } from "@/features/platform/utils/studentImportParse";

export function downloadStudentTemplate(): void {
  const dataSheet = XLSX.utils.aoa_to_sheet([[COLUMN_LABELS.studentCode, COLUMN_LABELS.username, COLUMN_LABELS.email]]);
  dataSheet["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 34 }];

  const guideSheet = XLSX.utils.aoa_to_sheet([
    ["Hướng dẫn nhập danh sách sinh viên"],
    ["1. Điền dữ liệu vào sheet đầu tiên, bắt đầu từ dòng 2. Không đổi tên các cột ở dòng 1."],
    [`2. Tối đa ${IMPORT_MAX_ROWS} dòng mỗi lần, file không quá 5 MB.`],
    [
      "3. “Mã sinh viên”: chữ, số, dấu - hoặc _, tối đa 20 ký tự. Nên đặt định dạng cột là Text để không mất số 0 ở đầu.",
    ],
    ["4. “Email”: email Google dùng để sinh viên đăng nhập. Mỗi email và mỗi mã sinh viên chỉ xuất hiện một lần."],
    ["5. Tài khoản mới ở trạng thái “Chờ kích hoạt”, tự kích hoạt khi sinh viên đăng nhập Google lần đầu."],
  ]);
  guideSheet["!cols"] = [{ wch: 110 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Danh sách");
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Hướng dẫn");
  XLSX.writeFile(workbook, IMPORT_TEMPLATE_FILE_NAME);
}
