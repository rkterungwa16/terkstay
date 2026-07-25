import { textField, colorField, sectionCard, humanize } from "../fields.js";
import { wireField } from "../state.js";

export default {
  key: "theme",
  label: "Theme",
  description: "Global colors, fonts, and pattern",

  render(container, { state, bus, draft }) {
    container.innerHTML = "";
    const w = (fieldFn, path, opts) => wireField(fieldFn, { bus, state, path, ...opts });

    // --- Colors -------------------------------------------------------
    const colors = sectionCard("Colors", "Global palette. Individual components can still override these.");
    colors.grid.classList.add("field-grid-colors");
    Object.keys(draft.theme.colors).forEach((key) => {
      colors.grid.appendChild(w(colorField, `theme.colors.${key}`, { label: humanize(key) }));
    });
    container.appendChild(colors.card);

    // --- Typography -----------------------------------------------------
    const typo = sectionCard("Typography", "Font stacks and the Google Fonts stylesheet URL that loads them.");
    typo.grid.appendChild(
      w(textField, "theme.typography.fontDisplay", {
        label: "Display font",
        hint: "Used for headings, e.g. \"'Fraunces', serif\"",
        mono: true
      })
    );
    typo.grid.appendChild(
      w(textField, "theme.typography.fontBody", {
        label: "Body font",
        hint: "Used for body text, e.g. \"'IBM Plex Sans', sans-serif\"",
        mono: true
      })
    );
    const urlField = w(textField, "theme.typography.googleFontsUrl", {
      label: "Google Fonts URL",
      hint: "Full <link> href pulling both fonts above.",
      mono: true
    });
    urlField.classList.add("field-wide");
    typo.grid.appendChild(urlField);
    container.appendChild(typo.card);

    // --- Shape -----------------------------------------------------------
    const shape = sectionCard("Shape", "Corner radius applied across cards, buttons, and inputs.");
    shape.grid.appendChild(w(textField, "theme.radius", { label: "Corner radius", hint: 'CSS length, e.g. "2px"' }));
    container.appendChild(shape.card);

    // --- Pattern -----------------------------------------------------------
    const pattern = sectionCard("Adire pattern", "The dotted indigo-dye motif used in the header strip and hero background.");
    pattern.grid.appendChild(w(colorField, "theme.pattern.dotColor", { label: "Dot color" }));
    pattern.grid.appendChild(w(textField, "theme.pattern.cellSize", { label: "Cell size", hint: 'CSS length, e.g. "20px"' }));
    pattern.grid.appendChild(w(textField, "theme.pattern.stripHeight", { label: "Strip height", hint: 'CSS length, e.g. "14px"' }));
    container.appendChild(pattern.card);
  }
};
