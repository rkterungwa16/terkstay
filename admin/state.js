import { bind } from "./pubsub.js";

// ─── flatten() ──────────────────────────────────────────────────────────
//
// Recurses into plain objects only — arrays are always a single leaf
// value, on purpose:
//
//  - Primitive-array leaves (a room type's `amenities`, bookingModal's
//    `paymentMethods`) work fine with reactive()'s shallowEqual, which
//    compares arrays index-by-index using ===.
//  - Object-array leaves (config.hotels, config.roomTypes) do NOT: two
//    different array instances holding the *same* nested object refs
//    would read as "equal" by a shallow compare even after some inner
//    field changed, and index-based paths (`hotels.2.name`) would
//    silently point at the wrong hotel the moment an add/remove shifts
//    the array. Those two collections are excluded from flatten() by
//    dashboard.js before it's called (see buildReactiveState) and stay on
//    the imperative render-and-mutate-draft-directly pattern already used
//    by amenities.js/roomTypes.js/hotels.js.
export function flatten(obj, prefix = "", out = {}) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out[path] = value;
    }
  });
  return out;
}

export function getPath(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export function setPath(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const node = keys.reduce((o, k) => o[k], obj);
  node[last] = value;
}

// ─── wireField() / wireCheckbox() ─────────────────────────────────────────
//
// Composes one of fields.js's builders with the reactive store: the
// field's own onChange writes into `state[path]` (which runs through
// reactive()'s shallowEqual + batching + publish), and bind() subscribes
// the produced input back to that same path so external writes — e.g.
// dashboard.js resetting `state` wholesale on Discard — repaint the field
// without needing a full section re-render.
export function wireField(fieldFn, { bus, state, path, ...opts }) {
  const el = fieldFn({
    ...opts,
    value: state[path],
    onChange: (v) => {
      state[path] = v;
    }
  });
  const input = el.querySelector("input, textarea, select");
  if (input) bind(bus, path, input);
  return el;
}

export function wireCheckbox(fieldFn, { bus, state, path, ...opts }) {
  const el = fieldFn({
    ...opts,
    checked: state[path],
    onChange: (v) => {
      state[path] = v;
    }
  });
  const input = el.querySelector('input[type="checkbox"]');
  if (input) bind(bus, path, input);
  return el;
}
