/*! solar-layout-card v1.0.5 | MIT License */
const VERSION = "1.0.5";

/* ---------- constants ---------- */
const GRID = 20;                 // px per grid cell in the editor
const PANEL_W = 3;               // portrait width in cells
const PANEL_H = 5;               // portrait height in cells
const CARD_TAG = "solar-layout-card";
const EDITOR_TAG = "solar-layout-card-editor";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const uid = () => Math.random().toString(36).slice(2, 9);

function fmt(hass, entity) {
  if (!entity || !hass || !hass.states[entity]) return { val: "—", unit: "" };
  const st = hass.states[entity];
  const unit = st.attributes.unit_of_measurement || "";
  const num = Number(st.state);
  const val = Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : st.state;
  return { val, unit };
}

// Enphase-style defaults: dark navy when off, light blue at full production.
const DEFAULT_COLOR_OFF = "#0b1f3a";   // donker / uit
const DEFAULT_COLOR_MAX = "#6fc3ff";   // lichtblauw / veel zon

// parse "#rgb" / "#rrggbb" to [r,g,b]
function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToCss([r, g, b]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// interpolate between colorOff and colorMax by ratio 0..1
function colorFor(ratio, colorOff, colorMax) {
  const a = hexToRgb(colorOff) || hexToRgb(DEFAULT_COLOR_OFF);
  const b = hexToRgb(colorMax) || hexToRgb(DEFAULT_COLOR_MAX);
  if (!Number.isFinite(ratio)) return rgbToCss(a); // no data -> "off" colour
  const r = clamp(ratio, 0, 1);
  return rgbToCss([
    a[0] + (b[0] - a[0]) * r,
    a[1] + (b[1] - a[1]) * r,
    a[2] + (b[2] - a[2]) * r,
  ]);
}

// pick readable text colour (black/white) for a given ratio's background
function textColorFor(ratio, colorOff, colorMax) {
  const a = hexToRgb(colorOff) || hexToRgb(DEFAULT_COLOR_OFF);
  const b = hexToRgb(colorMax) || hexToRgb(DEFAULT_COLOR_MAX);
  const r = Number.isFinite(ratio) ? clamp(ratio, 0, 1) : 0;
  const lum =
    (0.299 * (a[0] + (b[0] - a[0]) * r) +
      0.587 * (a[1] + (b[1] - a[1]) * r) +
      0.114 * (a[2] + (b[2] - a[2]) * r)) /
    255;
  return lum > 0.6 ? "#111" : "#fff";
}

/* ---------- inverters ---------- */
// Selectable inverter brands. Images can be swapped in later via IMG.
const INVERTERS = {
  goodwe:    { name: "GoodWe",    color: "#e2001a" },
  solaredge: { name: "SolarEdge", color: "#e2231a" },
  growatt:   { name: "Growatt",  color: "#f39800" },
  solis:     { name: "Solis",    color: "#00a0e9" },
};
const INVERTER_W = 4;   // width in cells
const INVERTER_H = 3;   // height in cells

/* ---------- sun ---------- */
// True when the sun is above the horizon (daytime), using HA's sun.sun entity.
// If the entity is missing we assume daytime so we don't hide warnings wrongly.
function isDaytime(hass) {
  const s = hass && hass.states && hass.states["sun.sun"];
  if (!s) return true;
  return s.state === "above_horizon";
}

// Normalize any config (old single-layout or new multi-layout) into a
// consistent shape: { ..., layouts: [ { id, name, panels:[], inverters:[] } ] }
function normalizeConfig(config) {
  const base = {
    title: config.title ?? "",
    reference: Number(config.reference) || 400,
    color_off: config.color_off || DEFAULT_COLOR_OFF,
    color_max: config.color_max || DEFAULT_COLOR_MAX,
    zoom: clamp(Number(config.zoom) || 100, 40, 100),
    font_scale: clamp(Number(config.font_scale) || 100, 50, 200),
  };
  const ref = base.reference;

  const normPanel = (p) => ({
    id: p.id || uid(),
    x: Number(p.x) || 0,
    y: Number(p.y) || 0,
    orientation: p.orientation === "landscape" ? "landscape" : "portrait",
    entity: p.entity || "",
    label: p.label || "",
    wp: Number(p.wp) > 0 ? Number(p.wp) : ref,
  });
  const normInverter = (v) => ({
    id: v.id || uid(),
    x: Number(v.x) || 0,
    y: Number(v.y) || 0,
    brand: INVERTERS[v.brand] ? v.brand : "goodwe",
    entity: v.entity || "",
    label: v.label || "",
  });

  let layouts;
  if (Array.isArray(config.layouts) && config.layouts.length) {
    layouts = config.layouts.map((l, i) => ({
      id: l.id || uid(),
      name: l.name || `Layout${i + 1}`,
      panels: (l.panels || []).map(normPanel),
      inverters: (l.inverters || []).map(normInverter),
    }));
  } else {
    // old style: a single implicit layout from top-level panels
    layouts = [
      {
        id: uid(),
        name: config.layout_name || "Layout1",
        panels: (config.panels || []).map(normPanel),
        inverters: (config.inverters || []).map(normInverter),
      },
    ];
  }
  return { ...base, layouts };
}

// Serialize back to config, collapsing to old single-layout style when there
// is only one layout (keeps configs clean and backward compatible).
function serializeConfig(cfg) {
  const out = {
    type: `custom:${CARD_TAG}`,
    title: cfg.title,
    reference: cfg.reference,
    color_off: cfg.color_off,
    color_max: cfg.color_max,
    zoom: cfg.zoom,
    font_scale: cfg.font_scale,
  };
  if (cfg.layouts.length <= 1) {
    const l = cfg.layouts[0] || { panels: [], inverters: [] };
    out.panels = l.panels;
    if (l.inverters && l.inverters.length) out.inverters = l.inverters;
    if (l.name && l.name !== "Layout1") out.layout_name = l.name;
  } else {
    out.layouts = cfg.layouts;
  }
  return out;
}


/* =====================================================================
 * The card
 * ===================================================================== */
class SolarLayoutCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._activeLayout = 0;
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig() {
    return {
      type: `custom:${CARD_TAG}`,
      title: "Zonnepanelen",
      reference: 400,
      color_off: DEFAULT_COLOR_OFF,
      color_max: DEFAULT_COLOR_MAX,
      zoom: 100,
      font_scale: 100,
      panels: [
        { id: uid(), x: 0, y: 0, orientation: "portrait", entity: "", label: "1", wp: 400 },
        { id: uid(), x: 4, y: 0, orientation: "portrait", entity: "", label: "2", wp: 400 },
      ],
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = normalizeConfig(config);
    if (this._activeLayout >= this._config.layouts.length) this._activeLayout = 0;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 6;
  }

  _layout() {
    return this._config.layouts[this._activeLayout] || { panels: [], inverters: [] };
  }

  _bounds() {
    const l = this._layout();
    const items = l.panels.concat(l.inverters || []);
    if (!items.length) return { cols: 8, rows: 6 };
    let cols = 0, rows = 0;
    for (const it of items) {
      const isInv = it.brand !== undefined;
      let w, h;
      if (isInv) { w = INVERTER_W; h = INVERTER_H; }
      else {
        w = it.orientation === "landscape" ? PANEL_H : PANEL_W;
        h = it.orientation === "landscape" ? PANEL_W : PANEL_H;
      }
      cols = Math.max(cols, it.x + w);
      rows = Math.max(rows, it.y + h);
    }
    return { cols: cols + 1, rows: rows + 1 };
  }

  _render() {
    if (!this._config) return;
    const hass = this._hass;
    const { cols, rows } = this._bounds();
    const off = this._config.color_off;
    const max = this._config.color_max;
    const zoom = clamp(Number(this._config.zoom) || 100, 40, 100);
    const fontScale = clamp(Number(this._config.font_scale) || 100, 50, 200) / 100;
    const layouts = this._config.layouts;
    const layout = this._layout();
    const daytime = isDaytime(hass);

    const panelsHtml = layout.panels
      .map((p) => {
        const w = p.orientation === "landscape" ? PANEL_H : PANEL_W;
        const h = p.orientation === "landscape" ? PANEL_W : PANEL_H;
        const { val, unit } = fmt(hass, p.entity);
        const hasState = hass && p.entity && hass.states[p.entity];
        const num = hasState ? Number(hass.states[p.entity].state) : NaN;
        const wp = Number(p.wp) > 0 ? Number(p.wp) : this._config.reference;
        const ratio = num / wp;
        const bg = colorFor(ratio, off, max);
        const fg = textColorFor(ratio, off, max);
        // warn: daytime + valid sensor reading exactly 0 W
        const warn = daytime && hasState && Number.isFinite(num) && num === 0;
        return `
          <div class="panel ${p.orientation}"
               style="grid-column:${p.x + 1}/span ${w};
                      grid-row:${p.y + 1}/span ${h};
                      background:${bg}; --fg:${fg};"
               data-entity="${p.entity}">
            <div class="cells"></div>
            <div class="reading">
              <span class="value">${val}</span>
              <span class="unit">${unit}</span>
            </div>
            ${p.label ? `<div class="plabel">${p.label}</div>` : ""}
            ${warn ? `<div class="warn" title="Overdag maar 0 W">!</div>` : ""}
          </div>`;
      })
      .join("");

    const invertersHtml = (layout.inverters || [])
      .map((v) => {
        const brand = INVERTERS[v.brand] || INVERTERS.goodwe;
        const { val, unit } = fmt(hass, v.entity);
        const reading = (hass && v.entity && hass.states[v.entity])
          ? `<div class="inv-reading">${val} ${unit}</div>` : "";
        return `
          <div class="inverter"
               style="grid-column:${v.x + 1}/span ${INVERTER_W};
                      grid-row:${v.y + 1}/span ${INVERTER_H};
                      --inv:${brand.color};"
               data-entity="${v.entity}">
            <div class="inv-brand">${brand.name}</div>
            ${v.label ? `<div class="inv-label">${v.label}</div>` : ""}
            ${reading}
          </div>`;
      })
      .join("");

    const showTabs = layouts.length > 1;
    const tabsHtml = showTabs
      ? `<div class="tabs">${layouts
          .map((l, i) =>
            `<button class="tab ${i === this._activeLayout ? "active" : ""}" data-idx="${i}">${l.name}</button>`)
          .join("")}</div>`
      : "";

    this.shadowRoot.innerHTML = `
      <style>${SolarLayoutCard.styles(cols, rows, zoom, fontScale)}</style>
      <ha-card>
        <div class="topbar">
          ${this._config.title ? `<div class="header">${this._config.title}</div>` : `<span></span>`}
          <div class="zoombar" title="Zoom">
            <button class="zoom-out" aria-label="Verklein">-</button>
            <span class="zoom-val">${zoom}%</span>
            <button class="zoom-in" aria-label="Vergroot">+</button>
          </div>
        </div>
        ${tabsHtml}
        <div class="gridwrap">
          <div class="grid">${(panelsHtml + invertersHtml) || `<div class="empty">Geen panelen. Open de editor.</div>`}</div>
        </div>
      </ha-card>
    `;

    // clicking a panel or inverter opens its sensor more-info
    this.shadowRoot.querySelectorAll(".panel, .inverter").forEach((el) => {
      el.addEventListener("click", () => {
        const entity = el.getAttribute("data-entity");
        if (!entity) return;
        this.dispatchEvent(
          new CustomEvent("hass-more-info", {
            detail: { entityId: entity },
            bubbles: true,
            composed: true,
          })
        );
      });
    });

    // tab switching
    this.shadowRoot.querySelectorAll(".tab").forEach((el) => {
      el.addEventListener("click", () => {
        this._activeLayout = Number(el.getAttribute("data-idx")) || 0;
        this._render();
      });
    });

    // zoom buttons adjust the runtime zoom without rewriting the config
    const step = 10;
    const setZoom = (z) => {
      this._config.zoom = clamp(z, 40, 100);
      this._render();
    };
    const zi = this.shadowRoot.querySelector(".zoom-in");
    const zo = this.shadowRoot.querySelector(".zoom-out");
    if (zi) zi.addEventListener("click", (e) => { e.stopPropagation(); setZoom(zoom + step); });
    if (zo) zo.addEventListener("click", (e) => { e.stopPropagation(); setZoom(zoom - step); });
  }

  static styles(cols, rows, zoom, fontScale) {
    const scale = (zoom || 100) / 100;
    const fs = fontScale || 1;
    // Text should barely shrink with zoom: only 30% of the zoom reduction is
    // applied to the font, so at 60% zoom the text is still ~88% size, not 60%.
    const textScale = (0.7 + 0.3 * scale) * fs;
    return `
      ha-card { padding: 12px; }
      .topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 2px 10px;
      }
      .header {
        font-size: 1.15rem; font-weight: 600;
        color: var(--primary-text-color);
      }
      .zoombar {
        display: inline-flex; align-items: center; gap: 6px;
        color: var(--secondary-text-color); font-size: .8rem;
      }
      .zoombar button {
        width: 26px; height: 26px; border-radius: 6px; cursor: pointer;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color); font-size: 1rem; line-height: 1;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .zoombar button:hover { filter: brightness(0.95); }
      .zoom-val { min-width: 38px; text-align: center; }
      .gridwrap {
        width: ${(scale * 100).toFixed(2)}%;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(${cols}, 1fr);
        grid-auto-rows: minmax(${Math.max(8, Math.round(14 * scale))}px, auto);
        gap: ${Math.max(2, Math.round(4 * scale))}px;
        aspect-ratio: ${cols} / ${rows};
        width: 100%;
      }
      .panel {
        position: relative;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.45);
        cursor: pointer;
        overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        transition: transform .12s ease, filter .12s ease, background .3s ease;
      }
      .panel:hover { transform: translateY(-1px); filter: brightness(1.08); }
      /* realistic solar cells: 6 x 10 grid for portrait, framed with a thin bus bar look */
      .panel .cells {
        position: absolute; inset: 2px;
        background-image:
          linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px),
          linear-gradient(rgba(0,0,0,0.28) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.28) 1px, transparent 1px);
        background-size:
          calc(100% / 6) calc(100% / 10),
          calc(100% / 6) calc(100% / 10),
          calc(100% / 6) calc(100% / 10),
          calc(100% / 6) calc(100% / 10);
        background-position: 0 0, 0 0, 0.5px 0.5px, 0.5px 0.5px;
        pointer-events: none;
        opacity: 0.9;
      }
      /* landscape: swap the cell grid to 10 x 6 */
      .panel.landscape .cells {
        background-size:
          calc(100% / 10) calc(100% / 6),
          calc(100% / 10) calc(100% / 6),
          calc(100% / 10) calc(100% / 6),
          calc(100% / 10) calc(100% / 6);
      }
      .reading {
        position: relative; z-index: 1; text-align: center;
        background: rgba(0,0,0,0.42); color: var(--fg, #fff);
        padding: ${Math.max(1, Math.round(2 * scale))}px ${Math.max(3, Math.round(6 * scale))}px;
        border-radius: 5px; line-height: 1.1;
        backdrop-filter: blur(1px);
      }
      .reading .value { font-weight: 700; font-size: ${(0.95 * textScale).toFixed(3)}rem; }
      .reading .unit { font-size: ${(0.7 * textScale).toFixed(3)}rem; margin-left: 2px; opacity: .9; }
      .plabel {
        position: absolute; top: 3px; left: 5px; z-index: 1;
        font-size: ${(0.65 * textScale).toFixed(3)}rem;
        color: var(--fg, #fff); opacity: 0.75; font-weight: 600;
      }
      .empty { padding: 24px; text-align: center; color: var(--secondary-text-color); }
      .tabs {
        display: flex; gap: 6px; flex-wrap: wrap; margin: 0 2px 10px;
        border-bottom: 1px solid var(--divider-color, #444);
        padding-bottom: 6px;
      }
      .tab {
        cursor: pointer; font: inherit; font-size: .85rem;
        padding: 5px 12px; border-radius: 6px 6px 0 0;
        border: 1px solid var(--divider-color, #444); border-bottom: none;
        background: transparent; color: var(--secondary-text-color);
      }
      .tab.active {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff); font-weight: 600;
      }
      .inverter {
        position: relative; border-radius: 6px;
        border: 2px solid var(--inv, #888);
        background: color-mix(in srgb, var(--inv, #888) 18%, var(--card-background-color, #1c1c1c));
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; overflow: hidden; gap: 2px;
        transition: filter .12s ease;
      }
      .inverter:hover { filter: brightness(1.08); }
      .inv-brand { font-weight: 700; color: var(--inv, #fff); font-size: ${(0.8 * (fontScale || 1)).toFixed(3)}rem; }
      .inv-label { font-size: ${(0.62 * (fontScale || 1)).toFixed(3)}rem; color: var(--secondary-text-color); }
      .inv-reading { font-size: ${(0.7 * (fontScale || 1)).toFixed(3)}rem; color: var(--primary-text-color); }
      .warn {
        position: absolute; top: 2px; right: 3px; z-index: 2;
        width: ${Math.max(14, Math.round(16 * (fontScale || 1)))}px;
        height: ${Math.max(14, Math.round(16 * (fontScale || 1)))}px;
        border-radius: 50%; background: #e53935; color: #fff;
        font-weight: 800; font-size: ${(0.7 * (fontScale || 1)).toFixed(3)}rem;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
      }
    `;
  }
}

/* =====================================================================
 * The visual editor (drag & drop)  — v1.0.1 rewrite
 *
 * Fixes vs v1.0.0:
 *  - DOM scaffold built ONCE; we never rebuild canvas/list on every change,
 *    so pointer-capture survives a drag and <select> dropdowns stay open.
 *  - Dragging mutates only the dragged element's inline style; config is
 *    committed on pointerup without a re-render.
 *  - Orientation toggle updates just that panel node + button text, so a
 *    single click is enough.
 * ===================================================================== */
class SolarLayoutCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._built = false;
    this._drag = null;
    this._entitiesFilled = false;
    this._activeLayout = 0;
  }

  setConfig(config) {
    this._config = normalizeConfig(config || {});
    if (this._activeLayout >= this._config.layouts.length) this._activeLayout = 0;
    this._built = false;
    this._build();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._built && !this._entitiesFilled) this._refreshEntityOptions();
  }

  _emit() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: serializeConfig(this._config) },
        bubbles: true,
        composed: true,
      })
    );
  }

  _entityList() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter((e) => e.startsWith("sensor."))
      .sort();
  }

  _layout() {
    return this._config.layouts[this._activeLayout];
  }

  _panels() {
    return this._layout().panels;
  }

  _inverters() {
    const l = this._layout();
    if (!l.inverters) l.inverters = [];
    return l.inverters;
  }

  _panel(id) {
    return this._panels().find((p) => p.id === id);
  }

  _inverter(id) {
    return this._inverters().find((v) => v.id === id);
  }

  _dims(p) {
    return p.orientation === "landscape"
      ? { w: PANEL_H, h: PANEL_W }
      : { w: PANEL_W, h: PANEL_H };
  }

  /* ---- one-time scaffold ---- */
  _build() {
    if (!this._config) return;
    const cols = 16, rows = 16;

    this.shadowRoot.innerHTML = `
      <style>${SolarLayoutCardEditor.styles(cols, rows)}</style>
      <div class="wrap">
        <div class="field">
          <label>Titel</label>
          <input id="title" type="text" />
        </div>
        <div class="field">
          <label>Standaard Wp voor nieuwe panelen (kleurschaal is per paneel)</label>
          <input id="reference" type="number" min="1" />
        </div>
        <div class="row2">
          <div class="field">
            <label>Kleur uit / geen zon</label>
            <input id="color_off" type="color" />
          </div>
          <div class="field">
            <label>Kleur max opbrengst</label>
            <input id="color_max" type="color" />
          </div>
        </div>
        <div class="row2">
          <div class="field">
            <label>Standaard zoom (%)</label>
            <input id="zoom" type="number" min="40" max="100" step="10" />
          </div>
          <div class="field">
            <label>Tekstgrootte (%)</label>
            <input id="font_scale" type="number" min="50" max="200" step="10" />
          </div>
        </div>

        <div class="canvaswrap">
          <div id="layouttabs" class="ltabs"></div>
          <div class="hint">Sleep de panelen en omvormers. Ze snappen op het raster.</div>
          <div class="canvas" id="canvas"></div>
        </div>

        <div class="addbar">
          <button id="add" class="add">+ Paneel</button>
          <button id="addinv" class="add">+ Omvormer</button>
        </div>

        <div class="list" id="list"></div>
        <div class="section-title">Omvormers</div>
        <div class="list" id="invlist"></div>
        <div class="ver">solar-layout-card v${VERSION}</div>
      </div>
    `;

    const sr = this.shadowRoot;
    const titleEl = sr.getElementById("title");
    const refEl = sr.getElementById("reference");
    const offEl = sr.getElementById("color_off");
    const maxEl = sr.getElementById("color_max");
    const zoomEl = sr.getElementById("zoom");
    const fontEl = sr.getElementById("font_scale");
    titleEl.value = this._config.title || "";
    refEl.value = this._config.reference;
    offEl.value = this._config.color_off;
    maxEl.value = this._config.color_max;
    zoomEl.value = this._config.zoom;
    fontEl.value = this._config.font_scale;

    titleEl.addEventListener("input", (e) => {
      this._config.title = e.target.value;
      this._emit();
    });
    refEl.addEventListener("input", (e) => {
      this._config.reference = Number(e.target.value) || 400;
      this._emit();
    });
    offEl.addEventListener("input", (e) => {
      this._config.color_off = e.target.value;
      this._emit();
    });
    maxEl.addEventListener("input", (e) => {
      this._config.color_max = e.target.value;
      this._emit();
    });
    zoomEl.addEventListener("input", (e) => {
      this._config.zoom = clamp(Number(e.target.value) || 100, 40, 100);
      this._emit();
    });
    fontEl.addEventListener("input", (e) => {
      this._config.font_scale = clamp(Number(e.target.value) || 100, 50, 200);
      this._emit();
    });
    sr.getElementById("add").addEventListener("click", () => this._addPanel());
    sr.getElementById("addinv").addEventListener("click", () => this._addInverter());

    this._built = true;
    this._entitiesFilled = false;
    this._renderLayoutTabs();
    this._renderCanvas();
    this._renderList();
    this._renderInverterList();
  }

  /* ---- layout tabs ---- */
  _renderLayoutTabs() {
    const wrap = this.shadowRoot.getElementById("layouttabs");
    if (!wrap) return;
    wrap.innerHTML = "";
    this._config.layouts.forEach((l, i) => {
      const tab = document.createElement("button");
      tab.className = "ltab" + (i === this._activeLayout ? " active" : "");
      tab.textContent = l.name;
      tab.addEventListener("click", () => {
        this._activeLayout = i;
        this._renderLayoutTabs();
        this._renderCanvas();
        this._renderList();
        this._renderInverterList();
        this._entitiesFilled = false;
        this._refreshEntityOptions();
      });
      // double-click to rename
      tab.addEventListener("dblclick", () => {
        const name = prompt("Naam van dit legplan:", l.name);
        if (name && name.trim()) {
          l.name = name.trim();
          this._renderLayoutTabs();
          this._emit();
        }
      });
      wrap.appendChild(tab);
    });
    const add = document.createElement("button");
    add.className = "ltab addtab";
    add.textContent = "+";
    add.title = "Nieuw legplan";
    add.addEventListener("click", () => this._addLayout());
    wrap.appendChild(add);

    if (this._config.layouts.length > 1) {
      const del = document.createElement("button");
      del.className = "ltab deltab";
      del.textContent = "verwijder legplan";
      del.title = "Verwijder huidig legplan";
      del.addEventListener("click", () => this._removeLayout());
      wrap.appendChild(del);
    }
  }

  _addLayout() {
    const n = this._config.layouts.length + 1;
    this._config.layouts.push({
      id: uid(),
      name: `Layout${n}`,
      panels: [],
      inverters: [],
    });
    this._activeLayout = this._config.layouts.length - 1;
    this._renderLayoutTabs();
    this._renderCanvas();
    this._renderList();
    this._renderInverterList();
    this._emit();
  }

  _removeLayout() {
    if (this._config.layouts.length <= 1) return;
    const name = this._layout().name;
    if (!confirm(`Legplan "${name}" verwijderen?`)) return;
    this._config.layouts.splice(this._activeLayout, 1);
    this._activeLayout = clamp(this._activeLayout, 0, this._config.layouts.length - 1);
    this._renderLayoutTabs();
    this._renderCanvas();
    this._renderList();
    this._renderInverterList();
    this._emit();
  }

  /* ---- canvas nodes ---- */
  _renderCanvas() {
    const canvas = this.shadowRoot.getElementById("canvas");
    if (!canvas) return;
    canvas.innerHTML = "";
    this._panels().forEach((p) => canvas.appendChild(this._makePanelNode(p)));
    this._inverters().forEach((v) => canvas.appendChild(this._makeInverterNode(v)));
  }

  _makeInverterNode(v) {
    const brand = INVERTERS[v.brand] || INVERTERS.goodwe;
    const el = document.createElement("div");
    el.className = "einv";
    el.dataset.id = v.id;
    el.dataset.kind = "inverter";
    el.style.left = v.x * GRID + "px";
    el.style.top = v.y * GRID + "px";
    el.style.width = INVERTER_W * GRID + "px";
    el.style.height = INVERTER_H * GRID + "px";
    el.style.setProperty("--inv", brand.color);
    el.innerHTML = `<span class="tag">${brand.name}</span>`;
    this._attachDrag(el);
    return el;
  }

  _makePanelNode(p) {
    const { w, h } = this._dims(p);
    const el = document.createElement("div");
    el.className = `epanel ${p.orientation}`;
    el.dataset.id = p.id;
    el.dataset.kind = "panel";
    el.style.left = p.x * GRID + "px";
    el.style.top = p.y * GRID + "px";
    el.style.width = w * GRID + "px";
    el.style.height = h * GRID + "px";
    el.innerHTML = `<span class="tag">${p.label || ""}</span>`;
    this._attachDrag(el);
    return el;
  }

  _attachDrag(el) {
    const getItem = () => {
      const id = el.dataset.id;
      return el.dataset.kind === "inverter" ? this._inverter(id) : this._panel(id);
    };
    el.addEventListener("pointerdown", (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      const p = getItem();
      if (!p) return;
      const canvas = this.shadowRoot.getElementById("canvas");
      const rect = canvas.getBoundingClientRect();
      el.setPointerCapture(ev.pointerId);
      this._drag = {
        el,
        pointerId: ev.pointerId,
        rect,
        item: p,
        offX: ev.clientX - rect.left - p.x * GRID,
        offY: ev.clientY - rect.top - p.y * GRID,
        x: p.x, y: p.y,
        moved: false,
      };
      el.classList.add("dragging");
    });

    el.addEventListener("pointermove", (ev) => {
      const d = this._drag;
      if (!d || d.el !== el || ev.pointerId !== d.pointerId) return;
      ev.preventDefault();
      const nx = clamp(Math.round((ev.clientX - d.rect.left - d.offX) / GRID), 0, 30);
      const ny = clamp(Math.round((ev.clientY - d.rect.top - d.offY) / GRID), 0, 30);
      if (nx !== d.x || ny !== d.y) d.moved = true;
      d.x = nx; d.y = ny;
      el.style.left = nx * GRID + "px";
      el.style.top = ny * GRID + "px";
    });

    const finish = () => {
      const d = this._drag;
      if (!d || d.el !== el) return;
      try { el.releasePointerCapture(d.pointerId); } catch (e) {}
      el.classList.remove("dragging");
      this._drag = null;
      if (d.moved && d.item) { d.item.x = d.x; d.item.y = d.y; this._emit(); }
    };
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
  }

  /* ---- side list ---- */
  _renderList() {
    const list = this.shadowRoot.getElementById("list");
    if (!list) return;
    list.innerHTML = "";
    if (!this._panels().length) {
      list.innerHTML = `<div class="muted">Nog geen panelen.</div>`;
      return;
    }
    this._panels().forEach((p) => list.appendChild(this._makeRow(p)));
    this._refreshEntityOptions();
  }

  _makeRow(p) {
    const row = document.createElement("div");
    row.className = "prow";
    row.dataset.id = p.id;

    const lbl = document.createElement("input");
    lbl.className = "lbl";
    lbl.type = "text";
    lbl.placeholder = "label";
    lbl.value = p.label || "";
    lbl.addEventListener("input", (e) => {
      p.label = e.target.value;
      const node = this._canvasNode(p.id);
      if (node) node.querySelector(".tag").textContent = p.label;
      this._emit();
    });

    // typed-search entity picker: text input backed by a <datalist>
    const listId = `ent-list-${p.id}`;
    const ent = document.createElement("input");
    ent.className = "ent";
    ent.type = "text";
    ent.setAttribute("list", listId);
    ent.placeholder = "zoek sensor...";
    ent.value = p.entity || "";
    const datalist = document.createElement("datalist");
    datalist.id = listId;
    const commit = (e) => {
      const v = e.target.value.trim();
      // accept exact match or clear; leave partials so the user can keep typing
      const opts = this._entityList();
      if (v === "" || opts.includes(v)) {
        p.entity = v;
        this._emit();
      }
    };
    ent.addEventListener("change", commit);
    ent.addEventListener("input", (e) => {
      const opts = this._entityList();
      if (opts.includes(e.target.value.trim())) commit(e);
    });

    const wp = document.createElement("input");
    wp.className = "wp";
    wp.type = "number";
    wp.min = "1";
    wp.placeholder = "Wp";
    wp.title = "Piekvermogen van dit paneel in Wp";
    wp.value = p.wp || "";
    wp.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      p.wp = v > 0 ? v : (this._config.reference || 400);
      this._emit();
    });

    const orient = document.createElement("button");
    orient.className = "orient";
    orient.textContent = p.orientation === "landscape" ? "liggend" : "staand";
    orient.title = "Wissel staand/liggend";
    orient.addEventListener("click", () => {
      p.orientation = p.orientation === "landscape" ? "portrait" : "landscape";
      orient.textContent = p.orientation === "landscape" ? "liggend" : "staand";
      const node = this._canvasNode(p.id);
      if (node) {
        const { w, h } = this._dims(p);
        node.className = `epanel ${p.orientation}`;
        node.style.width = w * GRID + "px";
        node.style.height = h * GRID + "px";
      }
      this._emit();
    });

    const dup = document.createElement("button");
    dup.className = "dup";
    dup.title = "Dupliceer paneel";
    dup.textContent = "⧉";
    dup.addEventListener("click", () => this._duplicatePanel(p.id));

    const del = document.createElement("button");
    del.className = "del";
    del.title = "verwijderen";
    del.textContent = "✕";
    del.addEventListener("click", () => this._removePanel(p.id));

    row.append(lbl, ent, datalist, wp, orient, dup, del);
    return row;
  }

  _canvasNode(id) {
    return this.shadowRoot.querySelector(`.epanel[data-id="${id}"]`);
  }

  _refreshEntityOptions() {
    const entities = this._entityList();
    if (!entities.length) return;
    const opts = entities.map((e) => `<option value="${e}"></option>`).join("");
    this.shadowRoot.querySelectorAll(".prow datalist, .irow datalist").forEach((dl) => {
      dl.innerHTML = opts;
    });
    this._entitiesFilled = true;
  }

  /* ---- add / remove ---- */
  _addPanel() {
    const p = {
      id: uid(),
      x: 0, y: 0,
      orientation: "portrait",
      entity: "",
      label: String(this._panels().length + 1),
      wp: this._config.reference || 400,
    };
    this._panels().push(p);
    const canvas = this.shadowRoot.getElementById("canvas");
    if (canvas) canvas.appendChild(this._makePanelNode(p));
    const list = this.shadowRoot.getElementById("list");
    if (list) {
      const muted = list.querySelector(".muted");
      if (muted) muted.remove();
      list.appendChild(this._makeRow(p));
      this._entitiesFilled = false;
      this._refreshEntityOptions();
    }
    this._emit();
  }

  _duplicatePanel(id) {
    const src = this._panel(id);
    if (!src) return;
    const { w } = this._dims(src);
    const copy = {
      id: uid(),
      x: clamp(src.x + w, 0, 30),
      y: src.y,
      orientation: src.orientation,
      entity: src.entity,
      wp: src.wp,
      label: src.label ? src.label + " kopie" : "",
    };
    this._panels().push(copy);
    const canvas = this.shadowRoot.getElementById("canvas");
    if (canvas) canvas.appendChild(this._makePanelNode(copy));
    const list = this.shadowRoot.getElementById("list");
    if (list) {
      const muted = list.querySelector(".muted");
      if (muted) muted.remove();
      list.appendChild(this._makeRow(copy));
      this._entitiesFilled = false;
      this._refreshEntityOptions();
    }
    this._emit();
  }

  _removePanel(id) {
    const l = this._layout();
    l.panels = l.panels.filter((p) => p.id !== id);
    const node = this._canvasNode(id);
    if (node) node.remove();
    const row = this.shadowRoot.querySelector(`.prow[data-id="${id}"]`);
    if (row) row.remove();
    this._emit();
  }

  /* ---- inverters ---- */
  _renderInverterList() {
    const list = this.shadowRoot.getElementById("invlist");
    if (!list) return;
    list.innerHTML = "";
    if (!this._inverters().length) {
      list.innerHTML = `<div class="muted">Nog geen omvormers.</div>`;
      return;
    }
    this._inverters().forEach((v) => list.appendChild(this._makeInverterRow(v)));
    this._refreshEntityOptions();
  }

  _makeInverterRow(v) {
    const row = document.createElement("div");
    row.className = "irow";
    row.dataset.id = v.id;

    const brand = document.createElement("select");
    brand.className = "brand";
    brand.innerHTML = Object.keys(INVERTERS)
      .map((k) => `<option value="${k}">${INVERTERS[k].name}</option>`)
      .join("");
    brand.value = v.brand;
    brand.addEventListener("change", (e) => {
      v.brand = e.target.value;
      const node = this._canvasNode(v.id);
      if (node) {
        const b = INVERTERS[v.brand] || INVERTERS.goodwe;
        node.style.setProperty("--inv", b.color);
        node.querySelector(".tag").textContent = b.name;
      }
      this._emit();
    });

    const lbl = document.createElement("input");
    lbl.className = "lbl";
    lbl.type = "text";
    lbl.placeholder = "label";
    lbl.value = v.label || "";
    lbl.addEventListener("input", (e) => {
      v.label = e.target.value;
      this._emit();
    });

    const listId = `inv-ent-${v.id}`;
    const ent = document.createElement("input");
    ent.className = "ent";
    ent.type = "text";
    ent.setAttribute("list", listId);
    ent.placeholder = "zoek sensor (optioneel)...";
    ent.value = v.entity || "";
    const datalist = document.createElement("datalist");
    datalist.id = listId;
    const commit = (e) => {
      const val = e.target.value.trim();
      const opts = this._entityList();
      if (val === "" || opts.includes(val)) { v.entity = val; this._emit(); }
    };
    ent.addEventListener("change", commit);
    ent.addEventListener("input", (e) => {
      if (this._entityList().includes(e.target.value.trim())) commit(e);
    });

    const del = document.createElement("button");
    del.className = "del";
    del.title = "verwijderen";
    del.textContent = "✕";
    del.addEventListener("click", () => this._removeInverter(v.id));

    row.append(brand, lbl, ent, datalist, del);
    return row;
  }

  _addInverter() {
    const v = {
      id: uid(),
      x: 0, y: 0,
      brand: "goodwe",
      entity: "",
      label: "",
    };
    this._inverters().push(v);
    const canvas = this.shadowRoot.getElementById("canvas");
    if (canvas) canvas.appendChild(this._makeInverterNode(v));
    const list = this.shadowRoot.getElementById("invlist");
    if (list) {
      const muted = list.querySelector(".muted");
      if (muted) muted.remove();
      list.appendChild(this._makeInverterRow(v));
      this._entitiesFilled = false;
      this._refreshEntityOptions();
    }
    this._emit();
  }

  _removeInverter(id) {
    const l = this._layout();
    l.inverters = (l.inverters || []).filter((v) => v.id !== id);
    const node = this._canvasNode(id);
    if (node) node.remove();
    const row = this.shadowRoot.querySelector(`.irow[data-id="${id}"]`);
    if (row) row.remove();
    this._emit();
  }

  static styles(cols, rows) {
    return `
      .wrap { display:flex; flex-direction:column; gap:12px; padding:4px; }
      .field { display:flex; flex-direction:column; gap:4px; }
      .row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .row2 input[type=color] { height:34px; padding:2px; cursor:pointer; }
      label { font-size:.8rem; color:var(--secondary-text-color); }
      input, select, button {
        font: inherit; padding:6px 8px; border-radius:6px;
        border:1px solid var(--divider-color,#ccc);
        background:var(--card-background-color, #fff);
        color:var(--primary-text-color);
      }
      .canvaswrap { border:1px dashed var(--divider-color,#ccc); border-radius:8px; padding:8px; }
      .hint { font-size:.75rem; color:var(--secondary-text-color); margin-bottom:6px; }
      .canvas {
        position:relative; width:${cols * GRID}px; height:${rows * GRID}px;
        margin:0 auto;
        background-image:
          linear-gradient(var(--divider-color,#e0e0e0) 1px, transparent 1px),
          linear-gradient(90deg, var(--divider-color,#e0e0e0) 1px, transparent 1px);
        background-size:${GRID}px ${GRID}px;
        border-radius:6px; touch-action:none; user-select:none;
      }
      .epanel {
        position:absolute; box-sizing:border-box;
        background:hsl(48,70%,60%); border:1px solid rgba(0,0,0,.35);
        border-radius:4px; cursor:grab; touch-action:none; user-select:none;
        display:flex; align-items:center; justify-content:center;
      }
      .epanel.dragging { cursor:grabbing; filter:brightness(1.1); z-index:5;
        box-shadow:0 2px 8px rgba(0,0,0,.3); }
      .epanel .tag { font-size:.7rem; color:rgba(0,0,0,.7); font-weight:600; pointer-events:none; }
      .add { cursor:pointer; }
      .addbar { display:flex; gap:8px; }
      .ltabs { display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px; }
      .ltab {
        cursor:pointer; font:inherit; font-size:.8rem; padding:4px 10px;
        border-radius:6px; border:1px solid var(--divider-color,#ccc);
        background:var(--card-background-color,#fff); color:var(--primary-text-color);
      }
      .ltab.active { background:var(--primary-color,#03a9f4); color:#fff; font-weight:600; }
      .ltab.addtab { font-weight:700; }
      .ltab.deltab { color:var(--error-color,#c00); margin-left:auto; }
      .section-title { font-size:.8rem; color:var(--secondary-text-color); margin-top:4px; font-weight:600; }
      .einv {
        position:absolute; box-sizing:border-box;
        background:color-mix(in srgb, var(--inv,#888) 22%, transparent);
        border:2px solid var(--inv,#888);
        border-radius:4px; cursor:grab; touch-action:none; user-select:none;
        display:flex; align-items:center; justify-content:center;
      }
      .einv.dragging { cursor:grabbing; filter:brightness(1.1); z-index:5; box-shadow:0 2px 8px rgba(0,0,0,.3); }
      .einv .tag { font-size:.62rem; color:var(--inv,#fff); font-weight:700; pointer-events:none; }
      .list { display:flex; flex-direction:column; gap:6px; }
      .prow { display:grid; grid-template-columns: 55px 1fr 62px auto auto auto; gap:6px; align-items:center; }
      .prow datalist, .irow datalist { display:none; }
      .prow .lbl { width:100%; }
      .prow .wp { width:100%; text-align:right; }
      .prow button { cursor:pointer; }
      .irow { display:grid; grid-template-columns: 110px 90px 1fr auto; gap:6px; align-items:center; }
      .irow .lbl { width:100%; }
      .irow button { cursor:pointer; }
      .del { color:var(--error-color,#c00); }
      .muted { color:var(--secondary-text-color); font-size:.85rem; }
      .ver { text-align:right; font-size:.7rem; color:var(--secondary-text-color); }
    `;
  }
}

customElements.define(CARD_TAG, SolarLayoutCard);
customElements.define(EDITOR_TAG, SolarLayoutCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TAG,
  name: "Solar Layout Card",
  description: "Legplan van zonnepanelen met live PV-opbrengst en drag & drop editor.",
  preview: true,
  documentationURL: "https://github.com/USERNAME/solar-layout-card",
});

console.info(
  `%c SOLAR-LAYOUT-CARD %c v${VERSION} `,
  "color:#111;background:#f4c40f;font-weight:700;border-radius:3px 0 0 3px;padding:2px 4px",
  "color:#f4c40f;background:#111;border-radius:0 3px 3px 0;padding:2px 4px"
);
