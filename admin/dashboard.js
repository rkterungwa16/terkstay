import metaSection from "./sections/meta.js";
import themeSection from "./sections/theme.js";
import policiesSection from "./sections/policies.js";
import amenitiesSection from "./sections/amenities.js";
import roomTypesSection from "./sections/roomTypes.js";
import hotelsSection from "./sections/hotels.js";
import componentsSection from "./sections/components.js";
import { EventBus, reactive } from "./pubsub.js";
import { flatten, setPath } from "./state.js";

// Every config.json top-level key now has a working editor — add new modules
// here as new config sections are introduced.
const SECTIONS = [metaSection, themeSection, policiesSection, amenitiesSection, roomTypesSection, hotelsSection, componentsSection];

// Powers the activity log below — same DEBUG-gated wildcard-channel
// principle as the reference framework: flip to false and the '*' channel
// never fires, at zero cost, while everything else (dirty-tracking, field
// binding) keeps working exactly the same either way.
const DEBUG = true;
const bus = new EventBus({ debug: DEBUG });

const el = {
  nav: document.getElementById("nav"),
  content: document.getElementById("content"),
  saveBtn: document.getElementById("saveBtn"),
  discardBtn: document.getElementById("discardBtn"),
  status: document.getElementById("status"),
  viewSiteLink: document.getElementById("viewSiteLink"),
  activityLog: document.getElementById("activityLog"),
  sidebar: document.getElementById("sidebar"),
  menuToggle: document.getElementById("menuToggle"),
  drawerBackdrop: document.getElementById("drawerBackdrop")
};

let original = null; // last-saved config, as fetched/confirmed from the server
let draft = null;    // working nested config the user is editing — sole source of truth for save
let state = null;    // flat reactive proxy over draft's leaf values (see buildReactiveState)
let dirty = false;
let activeKey = SECTIONS[0].key;
const activityEntries = [];

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Everything except the two array-of-objects collections gets flattened
// into the reactive store — see state.js's flatten() doc comment for why
// hotels/roomTypes are excluded.
function leafPortion(cfg) {
  const { hotels, roomTypes, ...rest } = cfg;
  return rest;
}

// Builds the flat reactive proxy once and wires a bookkeeping subscriber
// onto every leaf key: whatever a field writes into `state[path]` gets
// mirrored back into `draft` (so save/JSON.stringify stays correct) and
// marks the dashboard dirty — no section needs to call markDirty() itself
// for a reactive field ever again.
function buildReactiveState() {
  const flat = flatten(leafPortion(draft));
  const s = reactive(flat, bus);
  Object.keys(flat).forEach((path) => {
    bus.subscribe(path, ({ value }) => {
      setPath(draft, path, value);
      setDirty(true);
    });
  });
  return s;
}

function setStatus(text, kind) {
  el.status.textContent = text;
  el.status.className = "status" + (kind ? ` status-${kind}` : "");
}

function setDirty(next) {
  dirty = next;
  el.saveBtn.disabled = !dirty;
  el.discardBtn.disabled = !dirty;
  if (dirty) setStatus("Unsaved changes", "dirty");
}

// Still exposed to collection sections (amenities/roomTypes/hotels), which
// mutate `draft` directly for structural add/remove rather than going
// through the reactive store — see the module doc comments in state.js.
function markDirty() {
  setDirty(true);
}

function logActivity(path, payload) {
  activityEntries.unshift({ path, ...payload, time: new Date() });
  if (activityEntries.length > 8) activityEntries.length = 8;
  renderActivityLog();
}

function renderActivityLog() {
  if (!el.activityLog) return;
  if (activityEntries.length === 0) {
    el.activityLog.innerHTML = '<div class="activity-empty">No changes yet this session.</div>';
    return;
  }
  el.activityLog.innerHTML = activityEntries
    .map((e) => {
      const time = e.time.toLocaleTimeString("en", { hour12: false });
      const prev = JSON.stringify(e.prev);
      const value = JSON.stringify(e.value);
      return `<div class="activity-row"><span class="activity-time">${time}</span><span class="activity-path">${e.path}</span><span class="activity-diff">${prev} → ${value}</span></div>`;
    })
    .join("");
}

function renderNav() {
  el.nav.innerHTML = "";
  SECTIONS.forEach((section) => {
    const btn = document.createElement("button");
    btn.className = "nav-item" + (section.key === activeKey ? " active" : "");
    btn.innerHTML = `<span class="nav-label">${section.label}</span><span class="nav-desc">${section.description}</span>`;
    btn.addEventListener("click", () => {
      activeKey = section.key;
      renderNav();
      renderActiveSection();
      closeDrawer();
    });
    el.nav.appendChild(btn);
  });
}

function renderActiveSection() {
  const section = SECTIONS.find((s) => s.key === activeKey);
  section.render(el.content, { draft, state, bus, markDirty });
}

async function loadConfig() {
  setStatus("Loading…");
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load config (status ${res.status})`);
  const data = await res.json();
  original = data;
  draft = clone(data);
  state = buildReactiveState();
  setDirty(false);
  setStatus("Loaded");
}

async function saveConfig() {
  el.saveBtn.disabled = true;
  setStatus("Saving…");
  try {
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Save failed (status ${res.status})`);
    }
    original = clone(draft);
    setDirty(false);
    setStatus("Saved ✓", "ok");
  } catch (err) {
    setStatus(err.message, "error");
    el.saveBtn.disabled = false;
  }
}

// Writes every leaf key back through the *same* reactive proxy rather than
// rebuilding it — that's what lets already-bound fields on the current
// section repaint themselves via bind() with no re-render call needed.
// Collections (hotels/roomTypes) aren't wired into the reactive store, so
// that slice of `draft` is restored directly; the render() call after
// covers both cases uniformly and acts as a safety net for any field that
// isn't perfectly bound (e.g. the payment-methods list editor).
//
// setDirty(false) is deferred two animation frames rather than called
// immediately: reactive()'s writes above are rAF-batched, so the flush
// that actually publishes these reset values (and re-triggers the
// bookkeeping subscriber's setDirty(true)) hasn't run yet when this
// function returns. One rAF guarantees the flush has completed; a second
// guarantees we run strictly after it, so our "not dirty" wins instead of
// being silently overwritten by the flush's own publishes.
function discardChanges() {
  const flatOriginal = flatten(leafPortion(original));
  Object.keys(flatOriginal).forEach((path) => {
    state[path] = flatOriginal[path];
  });
  draft.hotels = clone(original.hotels);
  draft.roomTypes = clone(original.roomTypes);
  renderActiveSection();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      setDirty(false);
      setStatus("Changes discarded");
    })
  );
}

// ---------- Mobile sidebar drawer ----------
//
// Pure presentation state — doesn't touch config/dirty-tracking at all.
// The sidebar/backdrop only actually move under the max-width:800px query
// in dashboard.css; toggling these classes above that width is harmless
// (the CSS for .open simply doesn't apply).
function openDrawer() {
  el.sidebar.classList.add("open");
  el.drawerBackdrop.classList.add("open");
  el.menuToggle.classList.add("open");
  el.menuToggle.setAttribute("aria-expanded", "true");
}
function closeDrawer() {
  el.sidebar.classList.remove("open");
  el.drawerBackdrop.classList.remove("open");
  el.menuToggle.classList.remove("open");
  el.menuToggle.setAttribute("aria-expanded", "false");
}
function toggleDrawer() {
  el.sidebar.classList.contains("open") ? closeDrawer() : openDrawer();
}

el.menuToggle.addEventListener("click", toggleDrawer);
el.drawerBackdrop.addEventListener("click", closeDrawer);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

window.addEventListener("beforeunload", (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});

el.saveBtn.addEventListener("click", saveConfig);
el.discardBtn.addEventListener("click", discardChanges);

// Activity log — a visible demonstration of the DEBUG-gated '*' channel.
// This subscription costs nothing when DEBUG is false: EventBus.publish()
// never even looks up the '*' Map in that case.
bus.subscribe("*", ({ event, payload }) => logActivity(event, payload));
renderActivityLog();

(async function init() {
  try {
    await loadConfig();
    renderNav();
    renderActiveSection();
  } catch (err) {
    el.content.innerHTML = `<div class="card"><h3>Could not load config.json</h3><p>${err.message}</p></div>`;
    setStatus("Error", "error");
  }
})();
