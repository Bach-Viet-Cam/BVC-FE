import * as XLSX from "xlsx";
import {
  IMPORT_ACCEPT,
  IMPORT_MAX_BYTES,
  IMPORT_MAX_ROWS,
  IMPORT_SHEET_ROWS_LIMIT,
} from "@/features/platform/constants/userImportConstants";
import {
  buildStudentRows,
  COLUMN_LABELS,
  findHeaderRow,
  type StudentColumn,
  type StudentImportRow,
} from "@/features/platform/utils/studentImportParse";

export interface StudentExcelReadResult {
  rows: StudentImportRow[];
  error: string | null;
}

const failure = (error: string): StudentExcelReadResult => ({ rows: [], error });

function validateFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!IMPORT_ACCEPT.split(",").includes(extension)) return "Chỉ hỗ trợ file Excel .xlsx hoặc .xls.";
  if (file.size === 0) return "File rỗng.";
  if (file.size > IMPORT_MAX_BYTES) return `File quá lớn (tối đa ${IMPORT_MAX_BYTES / 1024 / 1024} MB).`;
  return null;
}

export async function readStudentExcel(file: File): Promise<StudentExcelReadResult> {
  const fileError = validateFile(file);
  if (fileError) return failure(fileError);

  let table: unknown[][];
  let firstSheetRow: number;
  try {
    const workbook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
      type: "array",
      sheetRows: IMPORT_SHEET_ROWS_LIMIT,
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet || !sheet["!ref"]) return failure("File không có dữ liệu.");
    firstSheetRow = XLSX.utils.decode_range(sheet["!ref"]).s.r;
    table = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "", blankrows: true });
  } catch {
    return failure("Không đọc được file Excel. File có thể bị hỏng hoặc đặt mật khẩu.");
  }

  const header = findHeaderRow(table);
  if (!header) return failure("File không có dữ liệu.");
  if (header.missing.length > 0) {
    const names = header.missing.map((column: StudentColumn) => `“${COLUMN_LABELS[column]}”`).join(", ");
    return failure(`Thiếu cột bắt buộc: ${names}. Hãy dùng file mẫu.`);
  }

  const rows = buildStudentRows(
    table,
    header.headerIndex,
    header.columns as Record<StudentColumn, number>,
    firstSheetRow
  );
  if (rows.length === 0) return failure("File không có dòng dữ liệu nào.");
  if (rows.length > IMPORT_MAX_ROWS)
    return failure(`File có quá nhiều dòng (tối đa ${IMPORT_MAX_ROWS} dòng mỗi lần import).`);
  return { rows, error: null };
}
