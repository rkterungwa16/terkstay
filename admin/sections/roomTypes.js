import { textField, numberField, colorField, checkboxGroupField, itemCard, pageHeader, smallButton } from "../fields.js";

export default {
  key: "roomTypes",
  label: "Room Types",
  description: "Tiers offered across hotels",

  render(container, { draft, markDirty }) {
    container.innerHTML = "";
    container.appendChild(
      pageHeader(
        "Room Types",
        "A hotel only offers a room type when its star rating meets \u201cMinimum stars\u201d below. " +
          "Id is the key used in every hotel\u2019s availability counts \u2014 renaming it won\u2019t rename matching hotel entries automatically."
      )
    );

    function renderList() {
      [...container.querySelectorAll(".item-card, .add-card")].forEach((el) => el.remove());

      draft.roomTypes.forEach((rt, idx) => {
        const { card, grid } = itemCard(rt.tag || rt.id || `Room type ${idx + 1}`, () => {
          draft.roomTypes.splice(idx, 1);
          markDirty();
          renderList();
        });

        grid.appendChild(
          textField({
            label: "Id",
            value: rt.id,
            mono: true,
            hint: "Referenced by hotel availability counts.",
            onChange: (v) => {
              rt.id = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          textField({
            label: "Display name",
            value: rt.tag,
            onChange: (v) => {
              rt.tag = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          numberField({
            label: "Capacity (guests)",
            value: rt.capacity,
            integer: true,
            min: 1,
            onChange: (v) => {
              rt.capacity = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          numberField({
            label: "Base price / night",
            value: rt.basePrice,
            step: 500,
            min: 0,
            onChange: (v) => {
              rt.basePrice = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          colorField({
            label: "Accent color",
            value: rt.color,
            onChange: (v) => {
              rt.color = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          numberField({
            label: "Minimum stars",
            value: rt.minStars,
            integer: true,
            min: 1,
            max: 5,
            onChange: (v) => {
              rt.minStars = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          checkboxGroupField({
            label: "Amenities",
            options: Object.keys(draft.amenities).map((k) => ({ value: k, label: draft.amenities[k].label })),
            selected: rt.amenities,
            onChange: (arr) => {
              rt.amenities = arr;
              markDirty();
            }
          })
        );

        container.appendChild(card);
      });

      const addCard = document.createElement("div");
      addCard.className = "card add-card";
      const h = document.createElement("h3");
      h.textContent = "Add room type";
      addCard.appendChild(h);
      addCard.appendChild(
        smallButton("+ Add room type", () => {
          const n = draft.roomTypes.length + 1;
          draft.roomTypes.push({
            id: "NewType" + n,
            tag: "New Room Type",
            capacity: 2,
            color: "#33528C",
            basePrice: 30000,
            amenities: [],
            minStars: 3
          });
          markDirty();
          renderList();
        })
      );
      container.appendChild(addCard);
    }

    renderList();
  }
};
