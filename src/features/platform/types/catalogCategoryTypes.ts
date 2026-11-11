export type CatalogCategoryType = "GENRE" | "LEVEL";
export type CatalogCategoryStatus = "ACTIVE" | "INACTIVE";
export type CatalogCategoryStatusFilter = "all" | "active" | "inactive";

export interface CatalogCategoryItem {
  id: string;
  type: CatalogCategoryType;
  name: string;
  description: string | null;
  displayOrder: number;
  status: CatalogCategoryStatus;
  usageCount: number;
  updatedAt: string;
}

export interface CatalogCategoryListParams {
  type: CatalogCategoryType;
  q?: string;
  status: CatalogCategoryStatusFilter;
  page: number;
  limit: number;
}

export interface CatalogCategoryListResult {
  items: CatalogCategoryItem[];
  pagination: { page: number; limit: number; total: number };
}

export interface CatalogCategoryCreateBody {
  type: CatalogCategoryType;
  name: string;
  description: string | null;
  displayOrder: number;
}

export type CatalogCategoryUpdateBody = Omit<CatalogCategoryCreateBody, "type">;

export const CATALOG_CATEGORY_TYPE_LABELS: Record<CatalogCategoryType, string> = {
  GENRE: "Thể loại",
  LEVEL: "Trình độ",
};
