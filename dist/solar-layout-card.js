/*! solar-layout-card v1.0.3 | MIT License */
const VERSION = "1.0.3";

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

/* =====================================================================
 * The card
 * ===================================================================== */
class SolarLayoutCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
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
      panels: [
        { id: uid(), x: 0, y: 0, orientation: "portrait", entity: "", label: "1", wp: 400 },
        { id: uid(), x: 4, y: 0, orientation: "portrait", entity: "", label: "2", wp: 400 },
      ],
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = {
      title: config.title ?? "",
      reference: Number(config.reference) || 400,
      color_off: config.color_off || DEFAULT_COLOR_OFF,
      color_max: config.color_max || DEFAULT_COLOR_MAX,
      zoom: clamp(Number(config.zoom) || 100, 40, 100),
      panels: (config.panels || []).map((p) => ({
        id: p.id || uid(),
        x: Number(p.x) || 0,
        y: Number(p.y) || 0,
        orientation: p.orientation === "landscape" ? "landscape" : "portrait",
        entity: p.entity || "",
        label: p.label || "",
        // per-panel Wp; fall back to the global reference for older configs
        wp: Number(p.wp) > 0 ? Number(p.wp) : (Number(config.reference) || 400),
      })),
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 6;
  }

  _bounds() {
    const p = this._config.panels;
    if (!p.length) return { cols: 8, rows: 6 };
    let cols = 0, rows = 0;
    for (const panel of p) {
      const w = panel.orientation === "landscape" ? PANEL_H : PANEL_W;
      const h = panel.orientation === "landscape" ? PANEL_W : PANEL_H;
      cols = Math.max(cols, panel.x + w);
      rows = Math.max(rows, panel.y + h);
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

    const panelsHtml = this._config.panels
      .map((p) => {
        const w = p.orientation === "landscape" ? PANEL_H : PANEL_W;
        const h = p.orientation === "landscape" ? PANEL_W : PANEL_H;
        const { val, unit } = fmt(hass, p.entity);
        const num = hass && p.entity && hass.states[p.entity]
          ? Number(hass.states[p.entity].state)
          : NaN;
        const wp = Number(p.wp) > 0 ? Number(p.wp) : this._config.reference;
        const ratio = num / wp;
        const bg = colorFor(ratio, off, max);
        const fg = textColorFor(ratio, off, max);
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
          </div>`;
      })
      .join("");

    this.shadowRoot.innerHTML = `
      <style>${SolarLayoutCard.styles(cols, rows, zoom)}</style>
      <ha-card>
        <div class="topbar">
          ${this._config.title ? `<div class="header">${this._config.title}</div>` : `<span></span>`}
          <div class="zoombar" title="Zoom">
            <button class="zoom-out" aria-label="Verklein">-</button>
            <span class="zoom-val">${zoom}%</span>
            <button class="zoom-in" aria-label="Vergroot">+</button>
          </div>
        </div>
        <div class="gridwrap">
          <div class="grid">${panelsHtml || `<div class="empty">Geen panelen. Open de editor.</div>`}</div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll(".panel").forEach((el) => {
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

  static styles(cols, rows, zoom) {
    const scale = (zoom || 100) / 100;
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
      .reading .value { font-weight: 700; font-size: ${(0.95 * scale).toFixed(3)}rem; }
      .reading .unit { font-size: ${(0.7 * scale).toFixed(3)}rem; margin-left: 2px; opacity: .9; }
      .plabel {
        position: absolute; top: 3px; left: 5px; z-index: 1;
        font-size: ${(0.65 * scale).toFixed(3)}rem;
        color: var(--fg, #fff); opacity: 0.75; font-weight: 600;
      }
      .empty { padding: 24px; text-align: center; color: var(--secondary-text-color); }
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
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._config.panels = this._config.panels || [];
    this._config.reference = this._config.reference || 400;
    this._config.color_off = this._config.color_off || DEFAULT_COLOR_OFF;
    this._config.color_max = this._config.color_max || DEFAULT_COLOR_MAX;
    this._config.zoom = clamp(Number(this._config.zoom) || 100, 40, 100);
    // backfill per-panel Wp from the global reference for older configs
    this._config.panels.forEach((p) => {
      if (!(Number(p.wp) > 0)) p.wp = this._config.reference;
    });
    this._built = false;
    this._build();
  }

  set hass(hass) {
    const hadHass = !!this._hass;
    this._hass = hass;
    if (this._built && !this._entitiesFilled) this._refreshEntityOptions();
  }

  _emit() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { type: `custom:${CARD_TAG}`, ...this._config } },
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

  _panel(id) {
    return this._config.panels.find((p) => p.id === id);
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
        <div class="field">
          <label>Standaard zoom (%)</label>
          <input id="zoom" type="number" min="40" max="100" step="10" />
        </div>

        <div class="canvaswrap">
          <div class="hint">Sleep de panelen. Ze snappen op het raster.</div>
          <div class="canvas" id="canvas"></div>
        </div>

        <button id="add" class="add">+ Paneel toevoegen</button>

        <div class="list" id="list"></div>
        <div class="ver">solar-layout-card v${VERSION}</div>
      </div>
    `;

    const sr = this.shadowRoot;
    const titleEl = sr.getElementById("title");
    const refEl = sr.getElementById("reference");
    const offEl = sr.getElementById("color_off");
    const maxEl = sr.getElementById("color_max");
    const zoomEl = sr.getElementById("zoom");
    titleEl.value = this._config.title || "";
    refEl.value = this._config.reference;
    offEl.value = this._config.color_off;
    maxEl.value = this._config.color_max;
    zoomEl.value = this._config.zoom;

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
    sr.getElementById("add").addEventListener("click", () => this._addPanel());

    this._built = true;
    this._entitiesFilled = false;
    this._renderCanvas();
    this._renderList();
  }

  /* ---- canvas nodes ---- */
  _renderCanvas() {
    const canvas = this.shadowRoot.getElementById("canvas");
    if (!canvas) return;
    canvas.innerHTML = "";
    this._config.panels.forEach((p) => canvas.appendChild(this._makePanelNode(p)));
  }

  _makePanelNode(p) {
    const { w, h } = this._dims(p);
    const el = document.createElement("div");
    el.className = `epanel ${p.orientation}`;
    el.dataset.id = p.id;
    el.style.left = p.x * GRID + "px";
    el.style.top = p.y * GRID + "px";
    el.style.width = w * GRID + "px";
    el.style.height = h * GRID + "px";
    el.innerHTML = `<span class="tag">${p.label || ""}</span>`;
    this._attachDrag(el);
    return el;
  }

  _attachDrag(el) {
    el.addEventListener("pointerdown", (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      const id = el.dataset.id;
      const p = this._panel(id);
      if (!p) return;
      const canvas = this.shadowRoot.getElementById("canvas");
      const rect = canvas.getBoundingClientRect();
      el.setPointerCapture(ev.pointerId);
      this._drag = {
        id, el,
        pointerId: ev.pointerId,
        rect,
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
      if (d.moved) {
        const p = this._panel(d.id);
        if (p) { p.x = d.x; p.y = d.y; this._emit(); }
      }
    };
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
  }

  /* ---- side list ---- */
  _renderList() {
    const list = this.shadowRoot.getElementById("list");
    if (!list) return;
    list.innerHTML = "";
    if (!this._config.panels.length) {
      list.innerHTML = `<div class="muted">Nog geen panelen.</div>`;
      return;
    }
    this._config.panels.forEach((p) => list.appendChild(this._makeRow(p)));
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

    const sel = document.createElement("select");
    sel.className = "ent";
    sel.addEventListener("change", (e) => {
      p.entity = e.target.value;
      this._emit();
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
    orient.textContent = p.orientation === "landscape" ? "⇋ landscape" : "⇅ portrait";
    orient.addEventListener("click", () => {
      p.orientation = p.orientation === "landscape" ? "portrait" : "landscape";
      orient.textContent = p.orientation === "landscape" ? "⇋ landscape" : "⇅ portrait";
      const node = this._canvasNode(p.id);
      if (node) {
        const { w, h } = this._dims(p);
        node.className = `epanel ${p.orientation}`;
        node.style.width = w * GRID + "px";
        node.style.height = h * GRID + "px";
      }
      this._emit();
    });

    const del = document.createElement("button");
    del.className = "del";
    del.title = "verwijderen";
    del.textContent = "✕";
    del.addEventListener("click", () => this._removePanel(p.id));

    row.append(lbl, sel, wp, orient, del);
    return row;
  }

  _canvasNode(id) {
    return this.shadowRoot.querySelector(`.epanel[data-id="${id}"]`);
  }

  _refreshEntityOptions() {
    const entities = this._entityList();
    if (!entities.length) return;
    this.shadowRoot.querySelectorAll(".prow").forEach((row) => {
      const id = row.dataset.id;
      const p = this._panel(id);
      const sel = row.querySelector(".ent");
      if (!sel || !p) return;
      const current = p.entity || "";
      sel.innerHTML =
        `<option value="">— sensor —</option>` +
        entities.map((e) => `<option value="${e}">${e}</option>`).join("");
      sel.value = current;
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
      label: String(this._config.panels.length + 1),
      wp: this._config.reference || 400,
    };
    this._config.panels.push(p);
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

  _removePanel(id) {
    this._config.panels = this._config.panels.filter((p) => p.id !== id);
    const node = this._canvasNode(id);
    if (node) node.remove();
    const row = this.shadowRoot.querySelector(`.prow[data-id="${id}"]`);
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
      .add { align-self:flex-start; cursor:pointer; }
      .list { display:flex; flex-direction:column; gap:6px; }
      .prow { display:grid; grid-template-columns: 60px 1fr 70px auto auto; gap:6px; align-items:center; }
      .prow .lbl { width:100%; }
      .prow .wp { width:100%; text-align:right; }
      .prow button { cursor:pointer; }
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
