// Small DOM builder helpers — no framework, just document.createElement.
// Every field function returns a wrapper <div class="field"> already wired
// up to call onChange(newValue) as the user types.

export function humanize(key) {
  // "indigoDeep" -> "Indigo Deep", "googleFontsUrl" -> "Google Fonts Url"
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function wrap(labelText, hint, inputEl) {
  const div = document.createElement("div");
  div.className = "field";
  const label = document.createElement("label");
  label.textContent = labelText;
  div.appendChild(label);
  div.appendChild(inputEl);
  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    div.appendChild(hintEl);
  }
  return div;
}

export function textField({ label, value, hint, onChange, mono }) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value ?? "";
  if (mono) input.classList.add("mono");
  input.addEventListener("input", () => onChange(input.value));
  return wrap(label, hint, input);
}

export function textareaField({ label, value, hint, onChange }) {
  const textarea = document.createElement("textarea");
  textarea.value = value ?? "";
  textarea.rows = 3;
  textarea.addEventListener("input", () => onChange(textarea.value));
  return wrap(label, hint, textarea);
}

export function colorField({ label, value, hint, onChange }) {
  const row = document.createElement("div");
  row.className = "color-row";

  const swatch = document.createElement("input");
  swatch.type = "color";
  swatch.value = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  const text = document.createElement("input");
  text.type = "text";
  text.className = "mono";
  text.value = value ?? "";

  swatch.addEventListener("input", () => {
    text.value = swatch.value;
    onChange(swatch.value);
  });
  text.addEventListener("input", () => {
    onChange(text.value);
    if (/^#[0-9a-fA-F]{6}$/.test(text.value)) swatch.value = text.value;
  });

  row.appendChild(swatch);
  row.appendChild(text);
  return wrap(label, hint, row);
}

export function sectionCard(title, description) {
  const card = document.createElement("div");
  card.className = "card";
  if (title) {
    const h = document.createElement("h3");
    h.textContent = title;
    card.appendChild(h);
  }
  if (description) {
    const p = document.createElement("p");
    p.className = "card-desc";
    p.textContent = description;
    card.appendChild(p);
  }
  const grid = document.createElement("div");
  grid.className = "field-grid";
  card.appendChild(grid);
  return { card, grid };
}
