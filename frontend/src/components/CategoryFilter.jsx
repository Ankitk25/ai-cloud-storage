import React from 'react';
import { Filter } from 'lucide-react';

const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const categoryColors = {
    all: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    photo: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    document: 'bg-red-100 text-red-800 hover:bg-red-200',
    screenshot: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    nature: 'bg-green-100 text-green-800 hover:bg-green-200',
    people: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 text-gray-600">
        <Filter className="w-4 h-4" />
        <span className="font-medium text-sm">Filter by Category</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* All Files */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : categoryColors.all
          }`}
        >
          All Files
        </button>

        {/* Dynamic Categories */}
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              selectedCategory === category
                ? 'ring-2 ring-indigo-500'
                : categoryColors[category.toLowerCase()] ||
                  categoryColors.all
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;