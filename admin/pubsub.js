// Generic pub/sub + reactive-state primitives, ported from the reference
// EventBus/reactive()/bind() framework. This file knows nothing about
// config.json or the dashboard — state.js and dashboard.js build on it.

// ─── EventBus ───────────────────────────────────────────────────────────
//
// O(1) unsubscribe via Map + auto-incrementing id, instead of an array +
// .filter() teardown (which is O(n) per unsubscribe).
// The '*' wildcard channel only fires when this bus was constructed with
// debug:true — same principle as the reference's module-level DEBUG flag,
// just scoped to the bus instance instead of a global constant so a page
// could run a debug bus and a silent one side by side if it ever needed to.
export class EventBus {
  constructor({ debug = false } = {}) {
    this._subs = {}; // { [event]: Map<id, fn> }
    this._nextId = 0;
    this.debug = debug;
  }

  subscribe(event, fn) {
    if (!this._subs[event]) this._subs[event] = new Map();
    const id = this._nextId++;
    this._subs[event].set(id, fn);
    return () => this._subs[event]?.delete(id); // O(1) teardown, no scan
  }

  publish(event, payload) {
    this._subs[event]?.forEach((fn) => fn(payload));
    if (this.debug) this._subs["*"]?.forEach((fn) => fn({ event, payload }));
  }
}

// ─── shallowEqual ─────────────────────────────────────────────────────────
//
// Structural top-level comparison so setting a value to something equal by
// content (not just by reference) is a no-op — no publish, no dirty flag,
// no DOM write. Works cleanly for primitives and for arrays/objects of
// primitives (index-by-index or key-by-key ===); see state.js for why that
// matters for which parts of config.json this gets applied to.
export function shallowEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  const ka = Object.keys(a),
    kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
}

// ─── reactive() ─────────────────────────────────────────────────────────
//
// Flat Proxy store: `state[key] = value` publishes {key, value, prev} on
// `bus`, batched into a single rAF flush per animation frame (so e.g.
// discarding twenty fields at once triggers one paint pass, not twenty),
// and skipped entirely when shallowEqual says nothing actually changed.
// No get trap — reads are native speed.
//
// Deliberately flat/single-level, matching the reference implementation:
// nested objects aren't deep-proxied, so `state.theme.colors.gold = x`
// would silently bypass the trap. Pair this with flatten()/setPath() from
// state.js for anything with real nesting.
export function reactive(initial, bus) {
  const target = { ...initial };
  const pending = new Set();
  let scheduled = false;

  function flush() {
    scheduled = false;
    for (const key of pending) {
      bus.publish(key, { key, value: target[key], prev: target[`_prev_${key}`] });
    }
    pending.clear();
  }

  return new Proxy(target, {
    set(t, key, value) {
      if (key.startsWith("_prev_")) {
        t[key] = value;
        return true;
      }
      const prev = t[key];
      if (shallowEqual(prev, value)) return true;

      t[`_prev_${key}`] = prev;
      t[key] = value;
      pending.add(key);
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
      return true;
    }
    // No get trap.
  });
}

// ─── bind() ───────────────────────────────────────────────────────────────
//
// Subscribes a DOM element to a bus channel, WeakRef-guarded: if the
// element is later removed (a section re-render, a discarded add/remove),
// the next publish on that key finds a dead ref, auto-unsubscribes, and
// does nothing else. No manual teardown bookkeeping required by callers.
//
// Trade-off, stated plainly: a key that never publishes again after its
// element is gone leaves an inert subscriber sitting in the bus — cleanup
// is lazy/publish-triggered, not eager. Fine for a form-editing tool that's
// reloaded per session; a long-lived SPA would want eager teardown too.
export function bind(bus, key, selector, transform = (v) => v) {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return () => {};

  const isCheckbox = el.type === "checkbox";
  const isFormEl = el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
  const ref = new WeakRef(el);

  let unsub;
  unsub = bus.subscribe(key, ({ value }) => {
    const node = ref.deref();
    if (!node) {
      unsub?.();
      return;
    }
    const display = transform(value);
    if (isCheckbox) node.checked = !!display;
    else if (isFormEl) node.value = display ?? "";
    else node.textContent = display;
  });
  return unsub;
}

// ─── twoWayBind() ─────────────────────────────────────────────────────────
//
// Same WeakRef guard on the DOM -> state direction, for the simple case of
// a single input whose 'input'/'change' event should write straight into
// state with no other side effects. Kept for parity with the reference and
// for any future plain-input field; the dashboard's own field helpers
// (fields.js) mostly compose bind() with their own onChange instead, since
// e.g. colorField has two inputs (swatch + text) that need to stay in
// sync — see state.js's wireField().
export function twoWayBind(bus, state, key, selector, coerce = (v) => v) {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!el) return () => {};

  const ref = new WeakRef(el);
  const eventName = el.type === "checkbox" ? "change" : "input";
  const onInput = (e) => {
    state[key] = coerce(el.type === "checkbox" ? e.target.checked : e.target.value);
  };
  el.addEventListener(eventName, onInput);

  const unsub = bind(bus, key, el);
  return () => {
    ref.deref()?.removeEventListener(eventName, onInput);
    unsub();
  };
}
