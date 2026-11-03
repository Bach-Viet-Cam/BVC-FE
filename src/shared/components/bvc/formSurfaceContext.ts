import { createContext, useContext } from "react";

// Form nằm trên trang (khung thẻ, nút dính đáy trang) hay trong modal (không khung, nút dính đáy modal)
export type FormSurface = "page" | "dialog";

export const FormSurfaceContext = createContext<FormSurface>("page");

export function useFormSurface() {
  return useContext(FormSurfaceContext);
}
