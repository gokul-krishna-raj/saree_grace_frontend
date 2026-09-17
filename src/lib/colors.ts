export const COLOR_MAP: Record<string, string> = {
  gold: "#D4AF37",
  maroon: "#800000",
  "royal blue": "#4169E1",
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  pink: "#EC4899",
  white: "#FFFFFF",
  black: "#000000",
  silver: "#C0C0C0",
  purple: "#9333EA",
  orange: "#EA580C",
  yellow: "#EAB308",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  navy: "#000080",
};

export const getColorHex = (colorName: string): string => {
  return COLOR_MAP[colorName.toLowerCase()] || colorName.toLowerCase();
};
