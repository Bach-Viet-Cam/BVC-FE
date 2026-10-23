import { useMusicCategories } from "@/features/music-library/hooks/useMusicCategories";
import { type CategoryRef } from "@/features/music-library/types/musicLibraryTypes";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

interface CategoryGroupProps {
  title: string;
  unit: string;
  items: CategoryRef[];
}

function CategoryGroup({ title, unit, items }: CategoryGroupProps) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-bvc-border bg-white">
      <div className="flex items-center gap-[10px] border-b border-bvc-border px-[18px] py-[14px]">
        <h2 className="m-0 text-[15px] font-bold text-bvc-ink">{title}</h2>
        <span className="rounded-[8px] bg-bvc-surface px-2 py-1 text-[12px] text-bvc-muted">
          {items.length} {unit}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="m-0 px-[18px] py-[16px] text-[14px] text-bvc-muted">Chưa có {unit} nào.</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-[8px] p-[16px]">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-[12px] border border-bvc-border-strong px-[12px] py-[7px] text-[14px] text-bvc-ink"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Giảng viên xem danh mục đang dùng trong thư viện (GET /library/filters); thêm / sửa danh mục do quản trị viên làm
export function CategoriesPage() {
  const { categories, error, isLoading } = useMusicCategories("lecturer");

  return (
    <TeacherScreen>
      <DesktopPageHeader breadcrumb="Thư viện học liệu" title="Phân loại nội dung" />

      <div className="flex flex-col gap-[16px] px-[18px] py-[20px] md:px-[32px]">
        <p className="m-0 text-[14px] text-bvc-muted">
          Danh mục dùng để gắn cho bài hát trong thư viện. Cần thêm danh mục mới, vui lòng liên hệ quản trị viên.
        </p>
        {isLoading && <p className="m-0 text-[14px] text-bvc-muted">Đang tải danh mục...</p>}
        {error && <p className="m-0 text-[14px] text-bvc-error">{error}</p>}
        {categories && (
          <div className="grid gap-[16px] lg:grid-cols-2">
            <CategoryGroup title="Nhạc cụ" unit="nhạc cụ" items={categories.instruments} />
            <CategoryGroup title="Thể loại" unit="thể loại" items={categories.genres} />
            <CategoryGroup title="Cấp độ" unit="cấp độ" items={categories.levels} />
          </div>
        )}
      </div>
    </TeacherScreen>
  );
}
