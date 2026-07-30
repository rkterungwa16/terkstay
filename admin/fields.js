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

export function numberField({ label, value, hint, onChange, step, min, max, integer }) {
  const input = document.createElement("input");
  input.type = "number";
  if (step !== undefined) input.step = step;
  if (min !== undefined) input.min = min;
  if (max !== undefined) input.max = max;
  input.value = value ?? 0;
  input.addEventListener("input", () => {
    if (input.value === "") return; // let the user clear the field while typing
    const num = integer ? parseInt(input.value, 10) : parseFloat(input.value);
    onChange(Number.isNaN(num) ? 0 : num);
  });
  return wrap(label, hint, input);
}

export function selectField({ label, value, options, hint, onChange }) {
  const select = document.createElement("select");
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === value) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener("change", () => onChange(select.value));
  return wrap(label, hint, select);
}

// Single boolean toggle — checkbox sits inline before its own label text.
export function checkboxField({ label, checked, hint, onChange }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const row = document.createElement("label");
  row.className = "checkbox-item";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !!checked;
  cb.addEventListener("change", () => onChange(cb.checked));
  row.appendChild(cb);
  row.appendChild(document.createTextNode(label));
  wrapper.appendChild(row);
  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}

// Multi-select as a row of checkboxes, e.g. picking which amenities a room type has.
export function checkboxGroupField({ label, options, selected, hint, onChange }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field field-wide";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const group = document.createElement("div");
  group.className = "checkbox-group";
  let current = (selected || []).slice();

  options.forEach((opt) => {
    const item = document.createElement("label");
    item.className = "checkbox-item";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = current.includes(opt.value);
    cb.addEventListener("change", () => {
      current = cb.checked ? [...current, opt.value] : current.filter((v) => v !== opt.value);
      onChange(current.slice());
    });
    item.appendChild(cb);
    item.appendChild(document.createTextNode(opt.label));
    group.appendChild(item);
  });

  wrapper.appendChild(group);
  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}

// Editable list of strings (e.g. payment methods) — add/remove rows inline.
export function listField({ label, hint, values, onChange }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field field-wide";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const rowsWrap = document.createElement("div");
  rowsWrap.className = "list-editor";
  wrapper.appendChild(rowsWrap);

  let current = (values || []).slice();

  function redraw() {
    rowsWrap.innerHTML = "";
    current.forEach((val, i) => {
      const row = document.createElement("div");
      row.className = "list-row";
      const input = document.createElement("input");
      input.type = "text";
      input.value = val;
      input.addEventListener("input", () => {
        current[i] = input.value;
        onChange(current.slice());
      });
      row.appendChild(input);
      row.appendChild(
        smallButton(
          "×",
          () => {
            current.splice(i, 1);
            onChange(current.slice());
            redraw();
          },
          "danger"
        )
      );
      rowsWrap.appendChild(row);
    });
    rowsWrap.appendChild(
      smallButton("+ Add", () => {
        current.push("");
        onChange(current.slice());
        redraw();
      })
    );
  }
  redraw();

  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}

// A single-select row of toggle buttons — "segmented-control" in the
// theme-settings schema (e.g. header width: Page / Full). No single native
// <input> exists here, so this can't be individually re-bound by bind() on
// Discard — the section's full re-render (see dashboard.js) is what
// repaints it in that case, same as listField/checkboxGroupField below.
export function segmentedField({ label, value, options, hint, onChange }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const group = document.createElement("div");
  group.className = "segmented";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", label);

  let current = value;
  const buttons = options.map((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "segmented-option" + (opt.value === current ? " active" : "");
    btn.setAttribute("aria-pressed", opt.value === current ? "true" : "false");
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      if (opt.value === current) return;
      current = opt.value;
      buttons.forEach((b, i) => {
        const isActive = options[i].value === current;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      onChange(current);
    });
    group.appendChild(btn);
    return btn;
  });

  wrapper.appendChild(group);
  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}

// Dropdown constrained to a fixed palette of named colors (e.g. the theme's
// 11 defined colors) — each option shows a swatch square + the color's
// name, rather than free-form hex entry. Native <select><option> can't
// render a colored swatch inside an option in any browser, so this is a
// small custom disclosure-button + listbox, not a real <select> — which
// also means (like segmentedField/switchField) there's no single native
// <input> for wireField's bind() to attach to; Discard falls back to the
// section's full re-render for this field type, same as those.
//
// `palette` is an array of { key, cssVar, hex, label }. `value` is matched
// against each entry's `cssVar` first, then its `hex` (so a config saved
// with a raw hex that happens to equal a palette color still shows that
// color selected, not "custom"). A `value` matching neither is shown as-is
// — swatch colored with the raw value, label showing the raw value — so
// this never crashes or silently drops an unrecognized color.
export function paletteField({ label, value, hint, palette, onChange }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field palette-field";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const box = document.createElement("div");
  box.className = "palette-box";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "palette-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const panel = document.createElement("div");
  panel.className = "palette-panel";
  panel.setAttribute("role", "listbox");
  panel.setAttribute("aria-label", label);
  panel.hidden = true;

  function findMatch(val) {
    return palette.find((p) => p.cssVar === val) || palette.find((p) => p.hex.toLowerCase() === String(val).toLowerCase());
  }

  function swatchEl(hex) {
    const sw = document.createElement("span");
    sw.className = "palette-swatch";
    sw.style.background = hex;
    return sw;
  }

  function renderTrigger() {
    const match = findMatch(value);
    trigger.innerHTML = "";
    trigger.appendChild(swatchEl(match ? match.hex : value));
    const text = document.createElement("span");
    text.className = "palette-trigger-label";
    text.textContent = match ? match.label : value;
    trigger.appendChild(text);
    const caret = document.createElement("span");
    caret.className = "palette-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▾";
    trigger.appendChild(caret);
  }

  function renderPanel() {
    panel.innerHTML = "";
    const match = findMatch(value);
    palette.forEach((p) => {
      const opt = document.createElement("button");
      opt.type = "button";
      opt.className = "palette-option" + (match?.key === p.key ? " selected" : "");
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-selected", match?.key === p.key ? "true" : "false");
      opt.appendChild(swatchEl(p.hex));
      const text = document.createElement("span");
      text.className = "palette-option-label";
      text.textContent = p.label;
      opt.appendChild(text);
      const hexText = document.createElement("span");
      hexText.className = "palette-option-hex mono";
      hexText.textContent = p.hex;
      opt.appendChild(hexText);
      opt.addEventListener("click", () => {
        value = p.cssVar;
        onChange(value);
        renderTrigger();
        closePanel();
      });
      panel.appendChild(opt);
    });
  }

  function onDocClick(e) {
    if (!box.contains(e.target)) closePanel();
  }
  function onKeydown(e) {
    if (e.key === "Escape") {
      closePanel();
      trigger.focus();
    }
  }
  function openPanel() {
    renderPanel();
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeydown);
  }
  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKeydown);
  }

  trigger.addEventListener("click", () => (panel.hidden ? openPanel() : closePanel()));

  renderTrigger();
  box.appendChild(trigger);
  box.appendChild(panel);
  wrapper.appendChild(box);
  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}


export function sliderField({ label, value, hint, onChange, min = 0, max = 100, step = 1, unit = "" }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const row = document.createElement("div");
  row.className = "slider-row";

  const input = document.createElement("input");
  input.type = "range";
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value ?? min;

  const readout = document.createElement("span");
  readout.className = "slider-readout";
  readout.textContent = `${input.value}${unit}`;

  input.addEventListener("input", () => {
    readout.textContent = `${input.value}${unit}`;
    onChange(Number(input.value));
  });

  row.appendChild(input);
  row.appendChild(readout);
  wrapper.appendChild(row);

  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}

// Boolean toggle styled as a switch rather than checkboxField's plain
// checkbox — "switch" in the schema (customer account / search enabled).
// Still a real <input type="checkbox"> underneath (role="switch" added for
// more precise screen-reader semantics), so wireCheckbox() binds it fine.
export function switchField({ label, checked, hint, onChange }) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const row = document.createElement("label");
  row.className = "switch-row";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("role", "switch");
  input.checked = !!checked;
  input.addEventListener("change", () => onChange(input.checked));

  const track = document.createElement("span");
  track.className = "switch-track";

  row.appendChild(input);
  row.appendChild(track);
  row.appendChild(document.createTextNode(label));
  wrapper.appendChild(row);

  if (hint) {
    const hintEl = document.createElement("div");
    hintEl.className = "field-hint";
    hintEl.textContent = hint;
    wrapper.appendChild(hintEl);
  }
  return wrapper;
}

export function smallButton(label, onClick, variant) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-mini" + (variant === "danger" ? " btn-mini-danger" : "");
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// A repeatable card for one item in an array (a hotel, a room type, an amenity),
// with a title and an optional remove button in its header.
export function itemCard(title, onRemove) {
  const card = document.createElement("div");
  card.className = "card item-card";
  const head = document.createElement("div");
  head.className = "item-card-head";
  const h = document.createElement("h3");
  h.textContent = title;
  head.appendChild(h);
  if (onRemove) head.appendChild(smallButton("Remove", onRemove, "danger"));
  card.appendChild(head);
  const grid = document.createElement("div");
  grid.className = "field-grid";
  card.appendChild(grid);
  return { card, grid };
}

// Plain (non-bordered) heading used atop list-style sections, before the
// repeated item cards.
export function pageHeader(title, description) {
  const wrap = document.createElement("div");
  wrap.className = "page-header";
  const h = document.createElement("h2");
  h.textContent = title;
  wrap.appendChild(h);
  if (description) {
    const p = document.createElement("p");
    p.textContent = description;
    wrap.appendChild(p);
  }
  return wrap;
}
