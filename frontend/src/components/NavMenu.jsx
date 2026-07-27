import MegaMenu from "./MegaMenu.jsx";
import { ChevronDownIcon } from "./HeaderIcons.jsx";

// A single nav item, recursively rendering its own dropdown children or a
// mega menu panel. `depth` controls submenu positioning: depth 0 (top-level)
// drops a panel down below the trigger; depth 1+ (a submenu item that itself
// has children) flies its own submenu out to the side, since it's already
// inside a dropdown panel.
function NavItem({ item, depth }) {
  const hasMega = item.menuType === "mega" && item.megaMenu;
  const hasDropdown = item.menuType === "dropdown" && item.children?.length > 0;
  const hasSubmenu = hasMega || hasDropdown;

  return (
    <li className={`nav-item-wrap depth-${depth}${hasSubmenu ? " has-submenu" : ""}`}>
      <a href={item.url} className="nav-link">
        {item.title}
        {hasSubmenu && <ChevronDownIcon />}
      </a>

      {hasMega && (
        <div className="submenu-panel mega-panel">
          <MegaMenu megaMenu={item.megaMenu} />
        </div>
      )}

      {hasDropdown && (
        <div className="submenu-panel dropdown-panel">
          <ul className="nav-menu nav-menu-sub">
            {item.children.map((child, i) => (
              <NavItem item={child} depth={depth + 1} key={child.id || `${child.title}-${i}`} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function NavMenu({ menu }) {
  if (!menu || !menu.items?.length) return null;
  return (
    <nav aria-label={menu.name || "Main navigation"}>
      <ul className="nav-menu">
        {menu.items.map((item) => (
          <NavItem item={item} depth={0} key={item.id || item.title} />
        ))}
      </ul>
    </nav>
  );
}
