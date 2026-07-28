import { useState } from "react";
import MegaMenu from "./MegaMenu.jsx";
import { ChevronDownIcon } from "./HeaderIcons.jsx";

// A single nav item, recursively rendering its own dropdown children or a
// mega menu panel. `depth` controls submenu positioning: depth 0 (top-level)
// drops a panel down below the trigger; depth 1+ (a submenu item that itself
// has children) flies its own submenu out to the side, since it's already
// inside a dropdown panel.
//
// Submenus reveal on desktop hover/focus-within (pure CSS, unchanged) *and*
// on click, tracked here as `open` state and reflected as a "force-open"
// class. That click path is what makes this usable on touch — there's no
// hover on a touch screen, so before this the only way these ever revealed
// content on mobile was a since-removed CSS rule that force-showed every
// submenu unconditionally (no way to close anything, panels not sized for
// being inline). Now a tap toggles just that item's panel open or closed,
// same as a real accordion.
function NavItem({ item, depth, onNavigate }) {
  const [open, setOpen] = useState(false);
  const hasMega = item.menuType === "mega" && item.megaMenu;
  const hasDropdown = item.menuType === "dropdown" && item.children?.length > 0;
  const hasSubmenu = hasMega || hasDropdown;

  function handleTriggerClick(e) {
    if (!hasSubmenu) {
      onNavigate?.();
      return;
    }
    // Items with a submenu use their url/href as a submenu-toggle trigger
    // rather than a real destination — matches how these are authored in
    // config.json today (url: "#"), and gives touch/keyboard users an
    // explicit, repeatable way to open *and close* the panel.
    e.preventDefault();
    setOpen((o) => !o);
  }

  return (
    <li className={`nav-item-wrap depth-${depth}${hasSubmenu ? " has-submenu" : ""}${open ? " force-open" : ""}`}>
      <a href={item.url} className="nav-link" onClick={handleTriggerClick} aria-expanded={hasSubmenu ? open : undefined}>
        {item.title}
        {hasSubmenu && <ChevronDownIcon />}
      </a>

      {hasMega && (
        <div className="submenu-panel mega-panel">
          <MegaMenu megaMenu={item.megaMenu} onNavigate={onNavigate} />
        </div>
      )}

      {hasDropdown && (
        <div className="submenu-panel dropdown-panel">
          <ul className="nav-menu nav-menu-sub">
            {item.children.map((child, i) => (
              <NavItem item={child} depth={depth + 1} onNavigate={onNavigate} key={child.id || `${child.title}-${i}`} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

// `onNavigate` fires whenever a leaf link (no submenu) is actually followed
// — the mobile drawer uses it to close itself after a real navigation,
// while a submenu-toggle click never fires it (there's nowhere to navigate
// to yet).
export default function NavMenu({ menu, onNavigate }) {
  if (!menu || !menu.items?.length) return null;
  return (
    <nav aria-label={menu.name || "Main navigation"}>
      <ul className="nav-menu">
        {menu.items.map((item) => (
          <NavItem item={item} depth={0} onNavigate={onNavigate} key={item.id || item.title} />
        ))}
      </ul>
    </nav>
  );
}
