import { textField, textareaField, colorField, checkboxField, listField, sectionCard, pageHeader, humanize } from "../fields.js";
import { wireField, wireCheckbox } from "../state.js";

const SUB_COMPONENTS = [
  { key: "header", label: "Header" },
  { key: "hero", label: "Hero" },
  { key: "searchPanel", label: "Search Panel" },
  { key: "hotelCard", label: "Hotel Card" },
  { key: "roomCard", label: "Room Card" },
  { key: "bookingModal", label: "Booking Modal" },
  { key: "confirmation", label: "Confirmation" },
  { key: "footer", label: "Footer" },
  { key: "buttons", label: "Buttons" }
];

// Persists across re-renders within the page session, so switching to
// another top-level section and back doesn't reset which sub-tab you were on.
let activeSub = "header";

function renderStyleCard(compKey, style, ctx) {
  const { card, grid } = sectionCard("Style", "CSS color values — hex, rgba(), or var(--token) references.");
  grid.classList.add("field-grid-colors");
  Object.keys(style).forEach((key) => {
    grid.appendChild(
      wireField(colorField, {
        bus: ctx.bus,
        state: ctx.state,
        path: `components.${compKey}.style.${key}`,
        label: humanize(key)
      })
    );
  });
  return card;
}

function renderContentCard(subKey, content, ctx) {
  const { card, grid } = sectionCard("Content", "Copy and labels shown on the live site.");
  const base = `components.${subKey}.content`;

  const text = (label, suffix, hint, wide) => {
    const el = wireField(textField, { bus: ctx.bus, state: ctx.state, path: `${base}.${suffix}`, label, hint });
    if (wide) el.classList.add("field-wide");
    grid.appendChild(el);
  };
  const textarea = (label, suffix, hint) => {
    const el = wireField(textareaField, { bus: ctx.bus, state: ctx.state, path: `${base}.${suffix}`, label, hint });
    el.classList.add("field-wide");
    grid.appendChild(el);
  };
  const bool = (label, suffix, hint) => {
    grid.appendChild(wireCheckbox(checkboxField, { bus: ctx.bus, state: ctx.state, path: `${base}.${suffix}`, label, hint }));
  };

  switch (subKey) {
    case "header":
      text("Logo text", "logoText");
      text("Logo subtitle", "logoSubtitle");
      bool("Show branch nav", "showBranchNav");
      break;

    case "hero":
      text("Eyebrow", "eyebrow");
      text("Heading", "heading", null, true);
      textarea("Lede", "lede");
      text("Search button label", "searchButtonLabel");
      break;

    case "searchPanel":
      text("Branch label", "labels.branch");
      text("Check-in label", "labels.checkIn");
      text("Check-out label", "labels.checkOut");
      text("Guests label", "labels.guests");
      text('"All branches" label', "allBranchesLabel");
      text("Title — all branches", "searchingTitleAll", null, true);
      text("Title — one branch", "searchingTitleBranch", "Supports {branch}", true);
      textarea("Empty state text", "emptyStateText");
      break;

    case "hotelCard":
      text('"View rooms" label', "viewRoomsLabel");
      text('"Unavailable" label', "unavailableLabel");
      text("No-fit message", "noFitLabel", null, true);
      text("Availability message", "availableLabel", "Supports {count} and {s}", true);
      text('"From" label', "fromLabel");
      text("Back-to-hotels label", "backToHotelsLabel");
      break;

    case "roomCard":
      text('"Book room" label', "bookLabel");
      text('"Sold out" label', "soldOutLabel");
      text("Sleeps message", "sleepsLabel", "Supports {n} and {s}");
      text("Not-enough-capacity suffix", "notEnoughLabel");
      text("Rooms-left message", "leftLabel", "Supports {n} and {s}");
      break;

    case "bookingModal":
      text("Modal title", "title");
      text("Confirmed title", "confirmedTitle");
      text("Payment section label", "paymentLabel");
      text("Cancel button label", "cancelLabel");
      text("Confirm button label", "confirmLabel");
      textarea("Validation error text", "errorText");
      text("Name field label", "fields.name");
      text("Name placeholder", "fields.namePlaceholder");
      text("Email field label", "fields.email");
      text("Email placeholder", "fields.emailPlaceholder");
      text("Phone field label", "fields.phone");
      text("Phone placeholder", "fields.phonePlaceholder");
      text("Requests field label", "fields.requests");
      text("Requests placeholder", "fields.requestsPlaceholder");
      // Composite widget (multiple inputs, not a single bindable element) —
      // writes straight into the reactive proxy; the section's own
      // full re-render (triggered on Discard) is what repaints this one,
      // rather than bind()'s single-element WeakRef mechanism.
      grid.appendChild(
        listField({
          label: "Payment methods",
          values: content.paymentMethods,
          onChange: (next) => {
            ctx.state[`${base}.paymentMethods`] = next;
          }
        })
      );
      break;

    case "confirmation":
      text("Stamp word", "stampWord");
      text("Badge text", "badgeText");
      textarea("Note", "note");
      text('"Make another booking" label', "newBookingLabel");
      break;

    case "footer":
      text("Chain name", "chainName");
      text("Phone", "phone");
      text("Email", "email");
      break;
  }

  return card;
}

export default {
  key: "components",
  label: "Components",
  description: "Per-component style & copy",

  render(container, ctx) {
    container.innerHTML = "";
    container.appendChild(
      pageHeader("Components", "Each piece of the site's UI — pick one below to edit its colors and copy.")
    );

    const components = ctx.draft.components;

    const tabs = document.createElement("div");
    tabs.className = "subtabs";
    SUB_COMPONENTS.forEach((sc) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "subtab" + (sc.key === activeSub ? " active" : "");
      btn.textContent = sc.label;
      btn.addEventListener("click", () => {
        activeSub = sc.key;
        this.render(container, ctx);
      });
      tabs.appendChild(btn);
    });
    container.appendChild(tabs);

    const comp = components[activeSub];
    if (comp.style) container.appendChild(renderStyleCard(activeSub, comp.style, ctx));
    if (comp.content) container.appendChild(renderContentCard(activeSub, comp.content, ctx));
  }
};
