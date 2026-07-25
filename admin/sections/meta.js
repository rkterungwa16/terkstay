import { textField, textareaField, sectionCard } from "../fields.js";

export default {
  key: "meta",
  label: "Meta",
  description: "Basic site identity",

  render(container, draft, markDirty) {
    container.innerHTML = "";

    const { card, grid } = sectionCard("Site meta", "Shown in the browser tab and used for site identity.");

    grid.appendChild(
      textField({
        label: "Site name",
        value: draft.meta.siteName,
        hint: 'e.g. "Adire Hotels & Suites" — appears in the browser tab title.',
        onChange: (val) => {
          draft.meta.siteName = val;
          markDirty();
        }
      })
    );

    grid.appendChild(
      textareaField({
        label: "Description",
        value: draft.meta.description,
        hint: "Short internal description of what this site is.",
        onChange: (val) => {
          draft.meta.description = val;
          markDirty();
        }
      })
    );

    container.appendChild(card);
  }
};
