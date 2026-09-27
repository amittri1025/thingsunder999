import {
  FiCoffee,
  FiHeart,
  FiMapPin,
  FiMoon,
  FiShoppingBag,
  FiSun,
  FiZap,
} from "react-icons/fi";

export const CATEGORIES = [
  "All",
  "Food",
  "Activities",
  "Places",
  "Shopping",
  "Date Ideas",
  "Nightlife",
  "Weekend",
];

export const PRICE_BANDS = [
  { label: "₹0–199", min: 0, max: 199 },
  { label: "₹200–499", min: 200, max: 499 },
  { label: "₹500–999", min: 500, max: 999 },
];

export const CATEGORY_COLORS = {
  Food: "#F29191",
  Activities: "#B1E5E6",
  Places: "#CCFBFA",
  Shopping: "#F7ADAD",
  "Date Ideas": "#F29191",
  Nightlife: "#B1E5E6",
  Weekend: "#F7ADAD",
};

export const CATEGORY_ICONS = {
  Food: FiCoffee,
  Activities: FiZap,
  Places: FiMapPin,
  Shopping: FiShoppingBag,
  "Date Ideas": FiHeart,
  Nightlife: FiMoon,
  Weekend: FiSun,
};
