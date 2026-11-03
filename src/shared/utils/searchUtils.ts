// Bỏ dấu tiếng Việt để "ly ngua o" vẫn tìm ra "Lý ngựa ô"
export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function matchesKeyword(keyword: string, fields: string[]) {
  const needle = normalizeText(keyword);
  if (!needle) return true;
  return fields.some((field) => normalizeText(field).includes(needle));
}
