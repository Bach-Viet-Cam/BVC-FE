export type StudentColumn = "studentCode" | "username" | "email";

export interface StudentImportRow {
  rowNumber: number;
  studentCode: string;
  username: string;
  email: string;
}

export interface HeaderMatch {
  headerIndex: number;
  columns: Partial<Record<StudentColumn, number>>;
  missing: StudentColumn[];
}

export const COLUMN_LABELS: Record<StudentColumn, string> = {
  studentCode: "Mã sinh viên",
  username: "Họ và tên",
  email: "Email",
};

const COLUMN_ALIASES: Record<StudentColumn, string[]> = {
  studentCode: ["masinhvien", "masv", "mssv", "studentcode"],
  username: ["hovaten", "hoten", "tensinhvien", "ten", "fullname", "username", "name"],
  email: ["email", "emailgoogle", "mail"],
};

const COLUMN_ORDER: StudentColumn[] = ["studentCode", "username", "email"];

/** "Mã sinh viên" → "masinhvien"; "Họ và tên" → "hovaten"; "EMAIL Google" → "emailgoogle". */
export function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => cellToString(cell) === "");
}

/** Dòng đầu tiên có dữ liệu được coi là dòng tiêu đề; cột trùng tên thì lấy cột đầu tiên. */
export function findHeaderRow(table: unknown[][]): HeaderMatch | null {
  const headerIndex = table.findIndex((row) => !isBlankRow(row));
  if (headerIndex === -1) return null;
  const columns: Partial<Record<StudentColumn, number>> = {};
  table[headerIndex].forEach((cell, columnIndex) => {
    const normalized = normalizeHeader(cell);
    for (const column of COLUMN_ORDER) {
      if (columns[column] === undefined && COLUMN_ALIASES[column].includes(normalized)) columns[column] = columnIndex;
    }
  });
  return { headerIndex, columns, missing: COLUMN_ORDER.filter((column) => columns[column] === undefined) };
}

/** `firstSheetRow` = chỉ số (từ 0) của dòng đầu tiên trong vùng dữ liệu của sheet, để số dòng báo lỗi khớp Excel. */
export function buildStudentRows(
  table: unknown[][],
  headerIndex: number,
  columns: Record<StudentColumn, number>,
  firstSheetRow: number
): StudentImportRow[] {
  const rows: StudentImportRow[] = [];
  for (let index = headerIndex + 1; index < table.length; index += 1) {
    const source = table[index];
    const row: StudentImportRow = {
      rowNumber: firstSheetRow + index + 1,
      studentCode: cellToString(source[columns.studentCode]),
      username: cellToString(source[columns.username]),
      email: cellToString(source[columns.email]),
    };
    if (row.studentCode === "" && row.username === "" && row.email === "") continue;
    rows.push(row);
  }
  return rows;
}
