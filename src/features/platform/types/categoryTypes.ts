export interface ContentCategoryChild {
  id: string;
  name: string;
  pieceCount: number;
}

export interface ContentCategoryNode extends ContentCategoryChild {
  children: ContentCategoryChild[];
}

export interface ContentCategoryItem {
  id: string;
  name: string;
  parentId: string | null;
}

/** Đối tượng đang được sửa trong dialog; `null` = đang thêm mới. */
export interface CategoryFormTarget {
  id: string;
  name: string;
  parentId: string | null;
}
