export const checkIsDarkColor = (color: string): boolean => {
  const [r, g, b] = hexToRgb(color);

  // https://www.w3.org/TR/AERT/#color-contrast
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128;
};

const hexToRgb = (hex: string): [number, number, number] => {
  // ショートバンド (e.g. #03F) をフルバンド (e.g. #0033FF) に変換
  const hexValue = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => r + r + g + g + b + b);

  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);

  if (!rgb) {
    throw new Error(`Invalid hex value: ${hex}`);
  }

  return [Number.parseInt(rgb[1], 16), Number.parseInt(rgb[2], 16), Number.parseInt(rgb[3], 16)];
};
