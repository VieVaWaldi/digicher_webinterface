const institutionIconSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
  <path fill="${color}" d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"/>
</svg>`;

export const institutionIconUrl = (color: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(institutionIconSvg(color))}`;

// Canvas-rendered cluster icon with count badge
const ICON_PATH = "M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z";
const clusterIconCache = new Map<string, string>();
const CLUSTER_ICON_SCALE = 2;
const LOGICAL_SIZE = 64;
export const CLUSTER_ICON_SIZE = LOGICAL_SIZE * CLUSTER_ICON_SCALE; // 128px — actual pixel size for deck.gl

// Quantize counts so we don't generate a unique icon for every single value.
// This keeps the deck.gl icon atlas small.
function quantize(n: number): number {
  if (n < 20) return n;
  if (n < 100) return Math.round(n / 5) * 5;
  if (n < 1000) return Math.round(n / 50) * 50;
  return Math.round(n / 500) * 500;
}

export function clusterIconUrl(color: string, count: number, isDark: boolean): string {
  const display = quantize(count);
  const key = `${color}-${display}`;
  const cached = clusterIconCache.get(key);
  if (cached) return cached;

  const w = LOGICAL_SIZE;
  const h = LOGICAL_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = w * CLUSTER_ICON_SCALE;
  canvas.height = h * CLUSTER_ICON_SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(CLUSTER_ICON_SCALE, CLUSTER_ICON_SCALE);

  // Draw institution icon (scale the 24x24 path to fill top portion)
  ctx.save();
  ctx.translate(8, 2);
  ctx.scale(2, 2);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(ICON_PATH));
  ctx.restore();

  // Count badge
  const text = display.toLocaleString();
  const fontSize = text.length > 4 ? 12 : text.length > 2 ? 15 : 18;
  const badgeH = 22;
  const badgeY = h - badgeH - 1;
  const badgeR = 6;

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  const textW = ctx.measureText(text).width;
  const badgeW = Math.max(28, textW + 14);
  const badgeX = (w - badgeW) / 2;

  // Badge background + border
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeR);
  ctx.fillStyle = isDark
    ? "rgba(30, 30, 30, 0.92)"
    : "rgba(255, 255, 255, 0.92)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Count text
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, badgeY + badgeH / 2);

  const url = canvas.toDataURL();
  clusterIconCache.set(key, url);
  return url;
}
