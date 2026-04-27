import React from "react";
import { Folder } from "lucide-react";

const CategoryCard = ({ category, onSelectCategory }) => {
  return (
    <button
      onClick={() => onSelectCategory(category.id)}
      className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <Folder
        className="mb-4 text-blue-500 transition-transform duration-200 group-hover:scale-110 dark:text-blue-400"
        size={48}
      />
      <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
        {category.name}
      </h3>
      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
        {category.description}
      </p>
    </button>
  );
};

export default CategoryCard;
