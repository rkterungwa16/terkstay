import { textField, textareaField, numberField, itemCard, pageHeader, smallButton } from "../fields.js";

export default {
  key: "hotels",
  label: "Hotels",
  description: "Properties and per-room availability",

  render(container, draft, markDirty) {
    container.innerHTML = "";
    container.appendChild(
      pageHeader("Hotels", "One card per property. Availability counts are rooms left per room type at this hotel.")
    );

    function renderList() {
      [...container.querySelectorAll(".item-card, .add-card")].forEach((el) => el.remove());

      draft.hotels.forEach((hotel, idx) => {
        const { card, grid } = itemCard(hotel.name || hotel.id || `Hotel ${idx + 1}`, () => {
          draft.hotels.splice(idx, 1);
          markDirty();
          renderList();
        });

        grid.appendChild(
          textField({
            label: "Id",
            value: hotel.id,
            mono: true,
            onChange: (v) => {
              hotel.id = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          textField({
            label: "Name",
            value: hotel.name,
            onChange: (v) => {
              hotel.name = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          textField({
            label: "City",
            value: hotel.city,
            onChange: (v) => {
              hotel.city = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          textField({
            label: "Area",
            value: hotel.area,
            onChange: (v) => {
              hotel.area = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          textField({
            label: "State",
            value: hotel.state,
            onChange: (v) => {
              hotel.state = v;
              markDirty();
            }
          })
        );
        grid.appendChild(
          numberField({
            label: "Star rating",
            value: hotel.stars,
            integer: true,
            min: 1,
            max: 5,
            onChange: (v) => {
              hotel.stars = v;
              markDirty();
              renderList(); // availability hints below depend on stars vs minStars
            }
          })
        );
        grid.appendChild(
          numberField({
            label: "Price factor",
            value: hotel.priceFactor,
            step: 0.01,
            min: 0,
            hint: "Multiplies each room type's base price for this hotel.",
            onChange: (v) => {
              hotel.priceFactor = v;
              markDirty();
            }
          })
        );

        const desc = textareaField({
          label: "Description",
          value: hotel.description,
          onChange: (v) => {
            hotel.description = v;
            markDirty();
          }
        });
        desc.classList.add("field-wide");
        grid.appendChild(desc);

        // --- Availability, one number field per room type ---
        const availWrap = document.createElement("div");
        availWrap.className = "field field-wide";
        const availLabel = document.createElement("label");
        availLabel.textContent = "Availability (rooms left)";
        availWrap.appendChild(availLabel);

        const availGrid = document.createElement("div");
        availGrid.className = "field-grid";
        availGrid.style.marginTop = "6px";

        if (!hotel.availability) hotel.availability = {};
        draft.roomTypes.forEach((rt) => {
          const belowStars = hotel.stars < rt.minStars;
          const field = numberField({
            label: rt.tag + (belowStars ? ` (needs ${rt.minStars}\u2605)` : ""),
            value: hotel.availability[rt.id] ?? 0,
            integer: true,
            min: 0,
            onChange: (v) => {
              hotel.availability[rt.id] = v;
              markDirty();
            }
          });
          if (belowStars) field.classList.add("field-dimmed");
          availGrid.appendChild(field);
        });
        availWrap.appendChild(availGrid);
        grid.appendChild(availWrap);

        container.appendChild(card);
      });

      const addCard = document.createElement("div");
      addCard.className = "card add-card";
      const h = document.createElement("h3");
      h.textContent = "Add hotel";
      addCard.appendChild(h);
      addCard.appendChild(
        smallButton("+ Add hotel", () => {
          const n = draft.hotels.length + 1;
          draft.hotels.push({
            id: "new-hotel-" + n,
            name: "New Hotel",
            city: "",
            area: "",
            state: "",
            stars: 3,
            description: "",
            priceFactor: 1.0,
            availability: {}
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
