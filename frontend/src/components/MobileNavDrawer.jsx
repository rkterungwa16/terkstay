import { useEffect, useRef } from "react";
import NavMenu from "./NavMenu.jsx";
import { MenuIcon, CloseIcon } from "./HeaderIcons.jsx";

function getFocusable(container) {
  if (!container) return [];
  return [...container.querySelectorAll('a[href], button:not([disabled])')];
}

// Off-canvas nav for mobile, controlled by the parent (App owns `open` so it
// can also `inert` the rest of the page while this is up — see App.jsx).
// Same shape as the admin dashboard's sidebar drawer: WeakRef-free here
// since React unmounts nothing (this component always renders, CSS decides
// visibility), but the same focus-trap / inert / restore-focus-on-close /
// matchMedia-auto-close behaviors apply.
export default function MobileNavDrawer({ menu, open, onOpenChange }) {
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open;

    if (open) {
      lastFocusedRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      const focusables = getFocusable(panelRef.current);
      (focusables[0] || panelRef.current)?.focus();
    } else {
      document.body.style.overflow = "";
      if (lastFocusedRef.current && document.contains(lastFocusedRef.current)) {
        lastFocusedRef.current.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeydown(e) {
      if (e.key === "Escape") {
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusable(panelRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [open, onOpenChange]);

  // The toggle button is display:none above the mobile breakpoint (CSS), so
  // widening the window while open is the only way this could get stuck —
  // force-close so body scroll lock / inert don't strand the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    function onChange(e) {
      if (!e.matches) onOpenChange(false);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onOpenChange]);

  return (
    <>
      <button
        type="button"
        className={"header-icon-btn mobile-nav-toggle" + (open ? " open" : "")}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobileNavPanel"
        onClick={() => onOpenChange(!open)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={"mobile-drawer-backdrop" + (open ? " open" : "")} aria-hidden="true" onClick={() => onOpenChange(false)} />

      <div
        id="mobileNavPanel"
        ref={panelRef}
        className={"mobile-drawer" + (open ? " open" : "")}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Site navigation"
      >
        <NavMenu menu={menu} onNavigate={() => onOpenChange(false)} />
      </div>
    </>
  );
}
