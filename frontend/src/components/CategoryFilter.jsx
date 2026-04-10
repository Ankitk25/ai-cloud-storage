import React from 'react';
import { Filter } from 'lucide-react';

const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const getButtonClass = (isActive) =>
    isActive
      ? 'border-cyan-300/35 bg-cyan-300/14 text-white shadow-[0_10px_24px_rgba(34,211,238,0.12)]'
      : 'border-white/8 bg-white/4 text-slate-300 hover:border-white/14 hover:bg-white/7 hover:text-white';

  return (
    <div className="surface-panel-soft p-4">
      <div className="mb-4 flex items-center gap-2 text-slate-300">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          Filter by category
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${getButtonClass(
            selectedCategory === 'all'
          )}`}
        >
          All Files
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${getButtonClass(
              selectedCategory === category
            )}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
