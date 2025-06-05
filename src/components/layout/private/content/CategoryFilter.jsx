// src/components/layout/private/content/CategoryFilter.jsx
import React from "react";

const CategoryFilter = ({ categories, currentFilter, onFilterChange }) => {
  return (
    <nav className="category-nav">
      <ul>
        <li>
          <button
            data-category="all"
            className={currentFilter === "all" ? "active" : ""}
            onClick={() => onFilterChange("all")}
          >
            Todas
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat}>
            <button
              data-category={cat}
              className={currentFilter === cat ? "active" : ""}
              onClick={() => onFilterChange(cat)}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryFilter;
