import { CATEGORIES, PRICE_BANDS } from "../constants";

const CATEGORY_EMOJIS = {
  All: "🌈",
  Food: "🍜",
  Activities: "🎉",
  Places: "🌿",
  Shopping: "🛍️",
  "Date Ideas": "💘",
  Nightlife: "🍸",
  Weekend: "🏕️",
};

export default function FilterPanel({ category, onCategoryChange, priceBand, onPriceBandChange }) {
  function renderCategoryChips(isDuplicate = false) {
    return CATEGORIES.map((item) => (
      <button
        key={item}
        type="button"
        className={`chip ${category === item ? "chip-active" : ""}`}
        onClick={() => onCategoryChange(item)}
        tabIndex={isDuplicate ? -1 : undefined}
      >
        <span aria-hidden="true">{CATEGORY_EMOJIS[item]}</span>
        {item}
      </button>
    ));
  }

  return (
    <aside className="filter-panel">
      <div className="filter-group">
        <h4>Category</h4>
        <div className="category-marquee">
          <div className="category-marquee-track">
            <div className="category-chip-set">{renderCategoryChips()}</div>
            <div className="category-chip-set" aria-hidden="true">{renderCategoryChips(true)}</div>
          </div>
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
