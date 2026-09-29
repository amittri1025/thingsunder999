import { CATEGORIES, PRICE_BANDS } from "../constants";
import { FiSliders } from "react-icons/fi";

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

export function CategoryMarquee({ category, onCategoryChange }) {
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
    <div className="category-marquee">
      <div className="category-marquee-track">
        <div className="category-chip-set">{renderCategoryChips()}</div>
        <div className="category-chip-set" aria-hidden="true">{renderCategoryChips(true)}</div>
      </div>
    </div>
  );
}

export default function FilterPanel({ priceBand, onPriceBandChange, isOpen, onToggle, panelId }) {
  return (
    <div className="filter-control">
      <button
        className="filter-toggle"
        type="button"
        aria-label="Price filters"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <FiSliders aria-hidden="true" />
        {priceBand && <span className="filter-active-dot" aria-label="Price filter active" />}
      </button>
      {isOpen && (
        <aside className="filter-panel" id={panelId}>
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
      )}
    </div>
  );
}
