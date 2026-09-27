import { CATEGORIES, CATEGORY_EMOJIS, PRICE_BANDS } from "../constants";

export default function FilterPanel({ category, onCategoryChange, priceBand, onPriceBandChange }) {
  return (
    <aside className="filter-panel">
      <div className="filter-group">
        <h4>Category</h4>
        <div className="filter-chips">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "chip-active" : ""}`}
              onClick={() => onCategoryChange(c)}
            >
              {c === "All" ? "🌈 " : `${CATEGORY_EMOJIS[c]} `}{c}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Price</h4>
        <div className="filter-chips">
          {PRICE_BANDS.map((band) => (
            <button
              key={band.label}
              className={`chip ${priceBand?.label === band.label ? "chip-active" : ""}`}
              onClick={() => onPriceBandChange(priceBand?.label === band.label ? null : band)}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
