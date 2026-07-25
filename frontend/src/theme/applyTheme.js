export function applyTheme(theme) {
  const root = document.documentElement.style;
  const c = theme.colors;
  root.setProperty("--indigo-deep", c.indigoDeep);
  root.setProperty("--indigo-mid", c.indigoMid);
  root.setProperty("--indigo-pale", c.indigoPale);
  root.setProperty("--gold", c.gold);
  root.setProperty("--gold-light", c.goldLight);
  root.setProperty("--ivory", c.ivory);
  root.setProperty("--ivory-dim", c.ivoryDim);
  root.setProperty("--ink", c.ink);
  root.setProperty("--palm", c.palm);
  root.setProperty("--rust", c.rust);
  root.setProperty("--white", c.white);

  root.setProperty("--font-display", theme.typography.fontDisplay);
  root.setProperty("--font-body", theme.typography.fontBody);
  root.setProperty("--radius", theme.radius);

  root.setProperty("--pattern-dot", theme.pattern.dotColor);
  root.setProperty("--pattern-cell", theme.pattern.cellSize);
  root.setProperty("--strip-height", theme.pattern.stripHeight);

  const fontsLink = document.getElementById("googleFontsLink");
  if (fontsLink && theme.typography.googleFontsUrl) {
    fontsLink.href = theme.typography.googleFontsUrl;
  }
}
