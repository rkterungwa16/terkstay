// Editor for a navigation menu's items (config.components.header.menus).
// Menu items are an arbitrarily-nested array of objects — the same shape
// of problem as hotels/roomTypes — so this stays on the imperative
// mutate-draft-directly-and-redraw pattern rather than the flat reactive
// store, for the same reason documented in state.js.
//
// Scope boundary, stated plainly: the *frontend* NavMenu component renders
// dropdown children recursively to any depth, since that's cheap and
// generic. This *editor* only goes two levels deep — a top-level item, and
// either its dropdown links or its mega-menu columns/links — because
// building an add/remove UI for arbitrary nesting depth is a lot of
// interface for a rare case. Deeper nesting (e.g. a dropdown link that
// itself opens a further submenu) can still be hand-authored directly in
// config.json; NavMenu.jsx will render it correctly either way.

import { textField, textareaField, selectField, itemCard, smallButton } from "./fields.js";

const MENU_TYPE_OPTIONS = [
  { value: "none", label: "Plain link" },
  { value: "dropdown", label: "Dropdown" },
  { value: "mega", label: "Mega menu" }
];

function subLabel(text) {
  const el = document.createElement("div");
  el.className = "menu-subsection-label";
  el.textContent = text;
  return el;
}

export function renderMenuEditor(container, menu, ctx) {
  function redraw() {
    container.innerHTML = "";
    renderMenuEditor(container, menu, ctx);
  }
  function changed() {
    ctx.markDirty();
  }

  // ---- Featured block (mega menu only) ----
  function renderFeaturedEditor(wrap, item) {
    wrap.appendChild(subLabel("Featured block"));

    if (!item.megaMenu.featured) {
      wrap.appendChild(
        smallButton("+ Add featured block", () => {
          item.megaMenu.featured = { title: "", description: "", image: "", buttonText: "", buttonUrl: "" };
          changed();
          redraw();
        })
      );
      return;
    }

    const f = item.megaMenu.featured;
    const grid = document.createElement("div");
    grid.className = "field-grid";
    grid.appendChild(textField({ label: "Title", value: f.title, onChange: (v) => { f.title = v; changed(); } }));
    grid.appendChild(textField({ label: "Button text", value: f.buttonText, onChange: (v) => { f.buttonText = v; changed(); } }));
    grid.appendChild(textField({ label: "Button URL", value: f.buttonUrl, onChange: (v) => { f.buttonUrl = v; changed(); } }));
    grid.appendChild(textField({ label: "Image URL", value: f.image, hint: "Optional — left blank shows no image", onChange: (v) => { f.image = v; changed(); } }));
    const desc = textareaField({ label: "Description", value: f.description, onChange: (v) => { f.description = v; changed(); } });
    desc.classList.add("field-wide");
    grid.appendChild(desc);
    wrap.appendChild(grid);
    wrap.appendChild(
      smallButton(
        "Remove featured block",
        () => {
          item.megaMenu.featured = null;
          changed();
          redraw();
        },
        "danger"
      )
    );
  }

  // ---- Mega menu columns ----
  function renderColumnsEditor(wrap, item) {
    wrap.appendChild(subLabel("Columns"));
    const list = document.createElement("div");
    list.className = "menu-column-list";

    item.megaMenu.columns.forEach((col, colIndex) => {
      const colCard = document.createElement("div");
      colCard.className = "menu-column-card";

      const head = document.createElement("div");
      head.className = "menu-child-row";
      head.appendChild(textField({ label: "Column title", value: col.title, onChange: (v) => { col.title = v; changed(); } }));
      head.appendChild(
        smallButton(
          "Remove column",
          () => {
            item.megaMenu.columns.splice(colIndex, 1);
            changed();
            redraw();
          },
          "danger"
        )
      );
      colCard.appendChild(head);

      col.links.forEach((link, linkIndex) => {
        const row = document.createElement("div");
        row.className = "menu-child-row";
        row.appendChild(textField({ label: "Link title", value: link.title, onChange: (v) => { link.title = v; changed(); } }));
        row.appendChild(textField({ label: "Link URL", value: link.url, onChange: (v) => { link.url = v; changed(); } }));
        row.appendChild(
          smallButton(
            "Remove",
            () => {
              col.links.splice(linkIndex, 1);
              changed();
              redraw();
            },
            "danger"
          )
        );
        colCard.appendChild(row);
      });

      colCard.appendChild(
        smallButton("+ Add link", () => {
          col.links.push({ title: "New link", url: "#" });
          changed();
          redraw();
        })
      );

      list.appendChild(colCard);
    });

    wrap.appendChild(list);
    wrap.appendChild(
      smallButton("+ Add column", () => {
        item.megaMenu.columns.push({ title: "New column", links: [] });
        changed();
        redraw();
      })
    );
  }

  // ---- Dropdown children ----
  function renderChildrenEditor(wrap, item) {
    wrap.appendChild(subLabel("Dropdown links"));
    const list = document.createElement("div");
    list.className = "menu-child-list";

    item.children.forEach((child, i) => {
      const row = document.createElement("div");
      row.className = "menu-child-row";
      row.appendChild(textField({ label: "Title", value: child.title, onChange: (v) => { child.title = v; changed(); } }));
      row.appendChild(textField({ label: "URL", value: child.url, onChange: (v) => { child.url = v; changed(); } }));
      row.appendChild(
        smallButton(
          "Remove",
          () => {
            item.children.splice(i, 1);
            changed();
            redraw();
          },
          "danger"
        )
      );
      list.appendChild(row);
    });

    wrap.appendChild(list);
    wrap.appendChild(
      smallButton("+ Add link", () => {
        item.children.push({ title: "New link", url: "#" });
        changed();
        redraw();
      })
    );
  }

  // ---- One top-level item ----
  menu.items.forEach((item, index) => {
    const { card, grid } = itemCard(item.title || `Item ${index + 1}`, () => {
      menu.items.splice(index, 1);
      changed();
      redraw();
    });

    grid.appendChild(textField({ label: "Title", value: item.title, onChange: (v) => { item.title = v; changed(); redrawTitleOnly(card, item); } }));
    grid.appendChild(textField({ label: "URL", value: item.url, hint: 'Use "#" for items whose only purpose is opening a submenu.', onChange: (v) => { item.url = v; changed(); } }));

    const typeField = selectField({
      label: "Type",
      value: item.menuType || "none",
      options: MENU_TYPE_OPTIONS,
      onChange: (v) => {
        item.menuType = v === "none" ? undefined : v;
        if (v === "dropdown") {
          delete item.megaMenu;
          if (!item.children) item.children = [];
        } else if (v === "mega") {
          delete item.children;
          if (!item.megaMenu) item.megaMenu = { columns: [], featured: null };
        } else {
          delete item.children;
          delete item.megaMenu;
        }
        changed();
        redraw();
      }
    });
    typeField.classList.add("field-wide");
    grid.appendChild(typeField);

    if (item.menuType === "dropdown") {
      const wrap = document.createElement("div");
      wrap.className = "field-wide";
      renderChildrenEditor(wrap, item);
      grid.appendChild(wrap);
    } else if (item.menuType === "mega") {
      const colWrap = document.createElement("div");
      colWrap.className = "field-wide";
      renderColumnsEditor(colWrap, item);
      grid.appendChild(colWrap);

      const featWrap = document.createElement("div");
      featWrap.className = "field-wide";
      renderFeaturedEditor(featWrap, item);
      grid.appendChild(featWrap);
    }

    container.appendChild(card);
  });

  container.appendChild(
    smallButton("+ Add menu item", () => {
      menu.items.push({ id: `item-${Date.now()}`, title: "New item", url: "#" });
      changed();
      redraw();
    })
  );

  // Renaming an item's title should update its card heading without a full
  // redraw (which would lose focus on the input the user is typing in).
  function redrawTitleOnly(card, item) {
    const h = card.querySelector(".item-card-head h3");
    if (h) h.textContent = item.title || "Untitled item";
  }
}
