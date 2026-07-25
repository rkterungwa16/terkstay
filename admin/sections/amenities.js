import { textField, selectField, itemCard, pageHeader, smallButton } from "../fields.js";

// Matches the icon names AmenityIcon.jsx knows how to draw.
const ICON_OPTIONS = ["wifi", "power", "breakfast", "pool", "gym", "shuttle"].map((v) => ({
  value: v,
  label: v
}));

export default {
  key: "amenities",
  label: "Amenities",
  description: "Icon + label pairs",

  render(container, { draft, markDirty }) {
    container.innerHTML = "";
    container.appendChild(
      pageHeader(
        "Amenities",
        "Referenced by room types via their key. Removing one still used by a room type just stops that pill from showing there — nothing breaks."
      )
    );

    function usedBy(key) {
      return draft.roomTypes.filter((rt) => rt.amenities.includes(key)).map((rt) => rt.tag);
    }

    function renderList() {
      [...container.querySelectorAll(".item-card, .add-card")].forEach((el) => el.remove());

      Object.keys(draft.amenities).forEach((key) => {
        const amenity = draft.amenities[key];
        const { card, grid } = itemCard(key, () => {
          delete draft.amenities[key];
          markDirty();
          renderList();
        });

        grid.appendChild(
          textField({
            label: "Label",
            value: amenity.label,
            onChange: (v) => {
              amenity.label = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          selectField({
            label: "Icon",
            value: amenity.icon,
            options: ICON_OPTIONS,
            onChange: (v) => {
              amenity.icon = v;
              markDirty();
            }
          })
        );

        const used = usedBy(key);
        if (used.length) {
          const note = document.createElement("div");
          note.className = "field-hint field-wide";
          note.textContent = "Used by: " + used.join(", ");
          grid.appendChild(note);
        }

        container.appendChild(card);
      });

      // --- Add new amenity ---
      const addCard = document.createElement("div");
      addCard.className = "card add-card";
      const h = document.createElement("h3");
      h.textContent = "Add amenity";
      addCard.appendChild(h);
      const grid = document.createElement("div");
      grid.className = "field-grid";
      addCard.appendChild(grid);

      let newKey = "";
      let newLabel = "";
      let newIcon = "wifi";

      grid.appendChild(
        textField({ label: "Key", value: "", hint: 'Unique id, e.g. "parking"', onChange: (v) => (newKey = v) })
      );
      grid.appendChild(textField({ label: "Label", value: "", onChange: (v) => (newLabel = v) }));
      grid.appendChild(
        selectField({ label: "Icon", value: newIcon, options: ICON_OPTIONS, onChange: (v) => (newIcon = v) })
      );

      const btnWrap = document.createElement("div");
      btnWrap.className = "field field-wide";
      btnWrap.appendChild(
        smallButton("+ Add amenity", () => {
          const key = newKey.trim();
          if (!key) return alert("Enter a key for the new amenity.");
          if (draft.amenities[key]) return alert("That key already exists.");
          draft.amenities[key] = { label: newLabel.trim() || key, icon: newIcon };
          markDirty();
          renderList();
        })
      );
      grid.appendChild(btnWrap);

      container.appendChild(addCard);
    }

    renderList();
  }
};
