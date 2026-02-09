const institutionIconSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
  <path fill="${color}" d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"/>
</svg>`;

export const institutionIconUrl = (color: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(institutionIconSvg(color))}`;

// Keep the old export for backwards compatibility
export const INSTITUTION_ICON_URL = institutionIconUrl("#2c5f66");
