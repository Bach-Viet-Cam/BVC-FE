export interface LlmKeyFormValues {
  name: string;
  key: string;
}

// Trả về map lỗi theo tên trường; rỗng nghĩa là hợp lệ.
export function validateLlmKey(values: LlmKeyFormValues, mode: "create" | "edit"): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = values.name.trim();
  const key = values.key.trim();
  if (!name) errors.name = "Vui lòng nhập tên API key.";
  else if (name.length > 100) errors.name = "Tên API key tối đa 100 ký tự.";
  if (!key) {
    if (mode === "create") errors.key = "Vui lòng nhập API key.";
  } else if (key.length < 10 || key.length > 512) {
    errors.key = "API key không hợp lệ.";
  }
  return errors;
}
