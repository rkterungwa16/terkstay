export function formatNaira(amount, currencySymbol) {
  return currencySymbol + Math.round(amount).toLocaleString("en-NG");
}

export function formatDate(dateStr, locale) {
  return new Date(dateStr).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function nightsBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function genBookingRef() {
  return "ADIRE-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

// Fills {placeholders} in a config-supplied string, e.g. tpl("{n} room{s} left", {n:2, s:"s"})
export function tpl(str, vars) {
  return Object.keys(vars).reduce(
    (s, k) => s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]),
    str
  );
}

export function plural(n) {
  return n === 1 ? "" : "s";
}
