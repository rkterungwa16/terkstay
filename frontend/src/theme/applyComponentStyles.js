// Maps a component's config-supplied style keys (camelCase, human-readable) onto the
// CSS custom property suffixes styles.css actually reads (e.g. background -> --header-bg).
const KEY_TO_SUFFIX = {
  background: "bg",
  textColor: "text",
  accentColor: "accent",
  labelColor: "label",
  fieldBorder: "field-border",
  badgeBg: "badge-bg",
  starColor: "star",
  priceColor: "price",
  availableColor: "available",
  border: "border",
  tierBadgeText: "badge-text",
  leftNoteColor: "left",
  headerBg: "header-bg",
  headerText: "header-text",
  payOptionBorder: "pay-border",
  payOptionSelectedBg: "pay-selected-bg",
  stampBorder: "stamp-border",
  stampText: "stamp-text",
  eyebrowColor: "eyebrow",
  ledeColor: "lede",
  primaryBg: "primary-bg",
  primaryText: "primary-text",
  primaryHoverBg: "primary-hover",
  outlineBorder: "outline-border",
  outlineText: "outline-text",
  outlineHoverBg: "outline-hover"
};

function setVars(prefix, style) {
  if (!style) return;
  const root = document.documentElement.style;
  Object.entries(style).forEach(([key, value]) => {
    const suffix = KEY_TO_SUFFIX[key];
    if (suffix) root.setProperty(`--${prefix}-${suffix}`, value);
  });
}

export function applyComponentStyles(components) {
  setVars("header", components.header?.style);
  setVars("hero", components.hero?.style);
  setVars("search", components.searchPanel?.style);
  setVars("hotelcard", components.hotelCard?.style);
  setVars("roomcard", components.roomCard?.style);
  setVars("modal", components.bookingModal?.style);
  setVars("pay", components.bookingModal?.style);
  setVars("stamp", components.confirmation?.style);
  setVars("footer", components.footer?.style);
  setVars("btn", components.buttons?.style);
}
