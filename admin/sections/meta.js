import { textField, textareaField, sectionCard } from "../fields.js";
import { wireField } from "../state.js";

export default {
  key: "meta",
  label: "Meta",
  description: "Basic site identity",

  render(container, { state, bus }) {
    container.innerHTML = "";

    const { card, grid } = sectionCard("Site meta", "Shown in the browser tab and used for site identity.");

    grid.appendChild(
      wireField(textField, {
        bus,
        state,
        path: "meta.siteName",
        label: "Site name",
        hint: 'e.g. "Adire Hotels & Suites" — appears in the browser tab title.'
      })
    );

    grid.appendChild(
      wireField(textareaField, {
        bus,
        state,
        path: "meta.description",
        label: "Description",
        hint: "Short internal description of what this site is."
      })
    );

    container.appendChild(card);
  }
};
