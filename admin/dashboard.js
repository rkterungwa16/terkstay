import metaSection from "./sections/meta.js";
import themeSection from "./sections/theme.js";
import { humanize } from "./fields.js";

// Sections with a working editor. Add new modules here as they're built —
// each one just needs { key, label, description, render(container, draft, markDirty) }.
const SECTIONS = [metaSection, themeSection];

// Config keys that exist but don't have an editor yet — shown greyed-out in
// the sidebar so it's clear what's coming without implying they're editable.
const COMING_SOON = ["policies", "amenities", "roomTypes", "hotels", "components"];

const el = {
  nav: document.getElementById("nav"),
  content: document.getElementById("content"),
  saveBtn: document.getElementById("saveBtn"),
  discardBtn: document.getElementById("discardBtn"),
  status: document.getElementById("status"),
  viewSiteLink: document.getElementById("viewSiteLink")
};

let original = null; // last-saved config, as fetched/confirmed from the server
let draft = null;    // working copy the user is editing
let dirty = false;
let activeKey = SECTIONS[0].key;

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
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

function markDirty() {
  setDirty(true);
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
    });
    el.nav.appendChild(btn);
  });

  COMING_SOON.forEach((key) => {
    const item = document.createElement("div");
    item.className = "nav-item nav-item-disabled";
    item.innerHTML = `<span class="nav-label">${humanize(key)}</span><span class="nav-desc">Coming soon</span>`;
    el.nav.appendChild(item);
  });
}

function renderActiveSection() {
  const section = SECTIONS.find((s) => s.key === activeKey);
  section.render(el.content, draft, markDirty);
}

async function loadConfig() {
  setStatus("Loading…");
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load config (status ${res.status})`);
  const data = await res.json();
  original = data;
  draft = clone(data);
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

function discardChanges() {
  draft = clone(original);
  setDirty(false);
  setStatus("Changes discarded");
  renderActiveSection();
}

window.addEventListener("beforeunload", (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});

el.saveBtn.addEventListener("click", saveConfig);
el.discardBtn.addEventListener("click", discardChanges);

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
