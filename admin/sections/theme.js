import { textField, colorField, sectionCard, humanize } from "../fields.js";

export default {
  key: "theme",
  label: "Theme",
  description: "Global colors, fonts, and pattern",

  render(container, draft, markDirty) {
    container.innerHTML = "";
    const theme = draft.theme;

    // --- Colors -------------------------------------------------------
    const colors = sectionCard("Colors", "Global palette. Individual components can still override these.");
    colors.grid.classList.add("field-grid-colors");
    Object.keys(theme.colors).forEach((key) => {
      colors.grid.appendChild(
        colorField({
          label: humanize(key),
          value: theme.colors[key],
          onChange: (val) => {
            theme.colors[key] = val;
            markDirty();
          }
        })
      );
    });
    container.appendChild(colors.card);

    // --- Typography -----------------------------------------------------
    const typo = sectionCard("Typography", "Font stacks and the Google Fonts stylesheet URL that loads them.");
    typo.grid.appendChild(
      textField({
        label: "Display font",
        value: theme.typography.fontDisplay,
        hint: "Used for headings, e.g. \"'Fraunces', serif\"",
        mono: true,
        onChange: (val) => {
          theme.typography.fontDisplay = val;
          markDirty();
        }
      })
    );
    typo.grid.appendChild(
      textField({
        label: "Body font",
        value: theme.typography.fontBody,
        hint: "Used for body text, e.g. \"'IBM Plex Sans', sans-serif\"",
        mono: true,
        onChange: (val) => {
          theme.typography.fontBody = val;
          markDirty();
        }
      })
    );
    const urlField = textField({
      label: "Google Fonts URL",
      value: theme.typography.googleFontsUrl,
      hint: "Full <link> href pulling both fonts above.",
      mono: true,
      onChange: (val) => {
        theme.typography.googleFontsUrl = val;
        markDirty();
      }
    });
    urlField.classList.add("field-wide");
    typo.grid.appendChild(urlField);
    container.appendChild(typo.card);

    // --- Radius -----------------------------------------------------------
    const shape = sectionCard("Shape", "Corner radius applied across cards, buttons, and inputs.");
    shape.grid.appendChild(
      textField({
        label: "Corner radius",
        value: theme.radius,
        hint: 'CSS length, e.g. "2px"',
        onChange: (val) => {
          theme.radius = val;
          markDirty();
        }
      })
    );
    container.appendChild(shape.card);

    // --- Pattern -----------------------------------------------------------
    const pattern = sectionCard("Adire pattern", "The dotted indigo-dye motif used in the header strip and hero background.");
    pattern.grid.appendChild(
      colorField({
        label: "Dot color",
        value: theme.pattern.dotColor,
        onChange: (val) => {
          theme.pattern.dotColor = val;
          markDirty();
        }
      })
    );
    pattern.grid.appendChild(
      textField({
        label: "Cell size",
        value: theme.pattern.cellSize,
        hint: 'CSS length, e.g. "20px"',
        onChange: (val) => {
          theme.pattern.cellSize = val;
          markDirty();
        }
      })
    );
    pattern.grid.appendChild(
      textField({
        label: "Strip height",
        value: theme.pattern.stripHeight,
        hint: 'CSS length, e.g. "14px"',
        onChange: (val) => {
          theme.pattern.stripHeight = val;
          markDirty();
        }
      })
    );
    container.appendChild(pattern.card);
  }
};
