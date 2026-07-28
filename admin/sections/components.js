import {
  textField,
  textareaField,
  colorField,
  checkboxField,
  listField,
  sectionCard,
  pageHeader,
  humanize,
  segmentedField,
  sliderField,
  selectField,
  switchField
} from "../fields.js";
import { wireField, wireCheckbox } from "../state.js";
import { renderMenuEditor } from "../menuEditor.js";

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

// Header-only settings beyond the generic style/content pattern every other
// component uses — appearance, logo/menu placement, search, customer
// account, and the main navigation menu itself. Kept in its own function
// rather than bolted onto renderContentCard's switch, since none of this
// is copy/color — it's structural configuration with its own field types
// (segmented control, slider, switch) straight from the reference schema.
function renderHeaderExtras(container, ctx) {
  const header = ctx.draft.components.header;
  const w = (fieldFn, path, opts) => wireField(fieldFn, { bus: ctx.bus, state: ctx.state, path, ...opts });
  const wc = (fieldFn, path, opts) => wireCheckbox(fieldFn, { bus: ctx.bus, state: ctx.state, path, ...opts });

  // --- Appearance ---
  const appearance = sectionCard("Appearance", "Overall shape of the header bar.");
  appearance.grid.appendChild(
    w(segmentedField, "components.header.appearance.width", {
      label: "Width",
      options: [
        { value: "page", label: "Page" },
        { value: "full", label: "Full" }
      ]
    })
  );
  appearance.grid.appendChild(
    w(segmentedField, "components.header.appearance.height", {
      label: "Height",
      options: [
        { value: "compact", label: "Compact" },
        { value: "standard", label: "Standard" }
      ]
    })
  );
  appearance.grid.appendChild(
    w(selectField, "components.header.appearance.stickyHeader", {
      label: "Sticky header",
      options: [
        { value: "never", label: "Never" },
        { value: "scroll-up", label: "Scroll Up" },
        { value: "always", label: "Always" }
      ]
    })
  );
  appearance.grid.appendChild(
    w(sliderField, "components.header.appearance.borderThickness", { label: "Border thickness", min: 0, max: 20, step: 1, unit: "px" })
  );
  appearance.grid.appendChild(
    w(segmentedField, "components.header.appearance.mobileNav", {
      label: "Mobile navigation",
      hint: "Drawer: hamburger opens an off-canvas panel. Dropdown: menu stays inline, each submenu opens on tap.",
      options: [
        { value: "drawer", label: "Drawer" },
        { value: "dropdown", label: "Dropdown" }
      ]
    })
  );
  container.appendChild(appearance.card);

  // --- Logo ---
  const logo = sectionCard("Logo", "Where the logo sits in the header.");
  logo.grid.appendChild(
    w(segmentedField, "components.header.logo.position", {
      label: "Position",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ]
    })
  );
  container.appendChild(logo.card);

  // --- Menu ---
  const menuCard = sectionCard("Menu", "Where the main navigation sits.");
  menuCard.grid.appendChild(
    w(segmentedField, "components.header.menu.position", {
      label: "Position",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ]
    })
  );
  menuCard.grid.appendChild(
    w(segmentedField, "components.header.menu.row", {
      label: "Row",
      options: [
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" }
      ]
    })
  );
  container.appendChild(menuCard.card);

  // --- Search ---
  const searchCard = sectionCard("Search", "The search icon in the header — activating it scrolls to and focuses the hotel search panel.");
  searchCard.grid.appendChild(wc(switchField, "components.header.search.enabled", { label: "Search icon" }));
  searchCard.grid.appendChild(
    w(segmentedField, "components.header.search.position", {
      label: "Position",
      options: [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" }
      ]
    })
  );
  searchCard.grid.appendChild(
    w(segmentedField, "components.header.search.row", {
      label: "Row",
      options: [
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" }
      ]
    })
  );
  container.appendChild(searchCard.card);

  // --- Customer account ---
  const accountCard = sectionCard("Customer account", "This demo has no real account system — enabling this shows a placeholder icon only.");
  accountCard.grid.appendChild(wc(switchField, "components.header.customerAccount.enabled", { label: "Account icon" }));
  container.appendChild(accountCard.card);

  // --- Main navigation menu ---
  // Structural (add/remove items, nested columns/children) — imperative,
  // like amenities/roomTypes/hotels, not part of the flat reactive store.
  const menuHeader = pageHeader("Main navigation", "The header's nav menu. Each item can be a plain link, a dropdown, or a mega menu.");
  container.appendChild(menuHeader);
  const menuEditorWrap = document.createElement("div");
  container.appendChild(menuEditorWrap);
  renderMenuEditor(menuEditorWrap, header.menus["main-navigation"], ctx);
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
    if (activeSub === "header") renderHeaderExtras(container, ctx);
  }
};
