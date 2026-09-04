import { cn } from "../../../../../../app/utils/cn";
import { Category } from "../../../../../../types/Category";

interface CategoriesFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory(categoryId: string): void;
}

/**
 * A faixa de categorias do aplicativo. No celular ela rola na horizontal — é
 * o mesmo gesto do `FlatList horizontal` original.
 */
export function CategoriesFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoriesFilterProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      <div className="flex w-max gap-4">
        {categories.map(category => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              aria-pressed={isSelected}
              className={cn(
                'flex w-16 shrink-0 flex-col items-center gap-1 transition-opacity',
                isSelected ? 'opacity-100' : 'opacity-50',
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                {category.icon}
              </span>

              <span className="text-center text-xs font-semibold text-gray-500">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
