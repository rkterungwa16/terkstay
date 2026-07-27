import { useEffect, useState } from "react";
import NavMenu from "./NavMenu.jsx";
import SearchToggle from "./SearchToggle.jsx";
import AccountLink from "./AccountLink.jsx";

// Tracks scroll direction and reports whether the header should be hidden —
// only does anything when stickyHeader === "scroll-up"; every other mode
// returns a no-op (header is never hidden).
function useHideOnScrollDown(enabled) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      // Ignore the first ~80px so the header doesn't flicker while the
      // page is essentially still at the top.
      setHidden(y > lastY && y > 80);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return hidden;
}

export default function Header({ config, cities, onSearchActivate }) {
  const { content, appearance, logo, menu, menus, customerAccount, search } = config;
  const mainMenu = menus?.["main-navigation"];

  const hidden = useHideOnScrollDown(appearance.stickyHeader === "scroll-up");

  const logoEl = (
    <div className="logo">
      {content.logoText} <small>{content.logoSubtitle}</small>
    </div>
  );
  const navEl = mainMenu ? <NavMenu menu={mainMenu} /> : null;
  const searchEl = search?.enabled ? <SearchToggle onActivate={onSearchActivate} /> : null;
  const accountEl = customerAccount?.enabled ? <AccountLink /> : null;

  // Distribute logo/menu/search into left/center/right zones for the top
  // row, based on each one's configured position. Account always sits at
  // the end of whichever zone search lands in (or the right zone if search
  // is off) — the schema doesn't give it its own position setting.
  const topZones = { left: [], center: [], right: [] };
  topZones[logo.position].push(<span key="logo">{logoEl}</span>);
  if (menu.row === "top" && navEl) topZones[menu.position].push(<span key="menu">{navEl}</span>);
  if (search?.enabled && search.row === "top") {
    const zone = search.position === "left" ? "left" : "right";
    topZones[zone].push(<span key="search">{searchEl}</span>);
    if (accountEl) topZones[zone].push(<span key="account">{accountEl}</span>);
  } else if (accountEl) {
    topZones.right.push(<span key="account">{accountEl}</span>);
  }

  const showBottomRow = (menu.row === "bottom" && navEl) || (search?.enabled && search.row === "bottom");

  return (
    <>
      <header
        className={"site" + (hidden ? " header-hidden" : "")}
        data-sticky={appearance.stickyHeader}
        style={{ borderBottomWidth: `${appearance.borderThickness}px` }}
      >
        <div className="header-inner" data-width={appearance.width} data-height={appearance.height}>
          <div className="header-row header-row-top">
            <div className="header-zone header-zone-left">{topZones.left}</div>
            <div className="header-zone header-zone-center">{topZones.center}</div>
            <div className="header-zone header-zone-right">{topZones.right}</div>
          </div>

          {showBottomRow && (
            <div className="header-row header-row-bottom">
              {menu.row === "bottom" && navEl}
              {search?.enabled && search.row === "bottom" && searchEl}
            </div>
          )}
        </div>
      </header>
      <div className="adire-strip" />
    </>
  );
}
