/*! solar-layout-card v1.0.0 | MIT License */
const VERSION = "1.0.0";

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

// colour ramp based on production relative to a reference (Wp or W)
function colorFor(ratio) {
  if (!Number.isFinite(ratio)) return "var(--disabled-text-color, #888)";
  const r = clamp(ratio, 0, 1);
  // grey (idle) -> yellow -> orange
  const hue = 48;                       // warm yellow
  const light = 92 - r * 45;            // 92% -> 47%
  const sat = 20 + r * 75;              // muted -> saturated
  return `hsl(${hue}, ${sat}%, ${light}%)`;
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
      reference: 400, // reference Wp/W used for colour scaling
      panels: [
        { id: uid(), x: 0, y: 0, orientation: "portrait", entity: "", label: "1" },
        { id: uid(), x: 4, y: 0, orientation: "portrait", entity: "", label: "2" },
      ],
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = {
      title: config.title ?? "",
      reference: Number(config.reference) || 400,
      unit_mode: config.unit_mode || "auto",
      panels: (config.panels || []).map((p) => ({
        id: p.id || uid(),
        x: Number(p.x) || 0,
        y: Number(p.y) || 0,
        orientation: p.orientation === "landscape" ? "landscape" : "portrait",
        entity: p.entity || "",
        label: p.label || "",
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
    const ref = this._config.reference;

    const panelsHtml = this._config.panels
      .map((p) => {
        const w = p.orientation === "landscape" ? PANEL_H : PANEL_W;
        const h = p.orientation === "landscape" ? PANEL_W : PANEL_H;
        const { val, unit } = fmt(hass, p.entity);
        const num = hass && p.entity && hass.states[p.entity]
          ? Number(hass.states[p.entity].state)
          : NaN;
        const bg = colorFor(num / ref);
        return `
          <div class="panel ${p.orientation}"
               style="grid-column:${p.x + 1}/span ${w};
                      grid-row:${p.y + 1}/span ${h};
                      background:${bg};"
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
      <style>${SolarLayoutCard.styles(cols, rows)}</style>
      <ha-card>
        ${this._config.title ? `<div class="header">${this._config.title}</div>` : ""}
        <div class="grid">${panelsHtml || `<div class="empty">Geen panelen — open de editor.</div>`}</div>
      </ha-card>
    `;

    // clicking a panel opens its more-info dialog
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
  }

  static styles(cols, rows) {
    return `
      ha-card { padding: 12px; }
      .header {
        font-size: 1.15rem; font-weight: 600; padding: 4px 4px 12px;
        color: var(--primary-text-color);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(${cols}, 1fr);
        grid-auto-rows: minmax(14px, auto);
        gap: 4px;
        aspect-ratio: ${cols} / ${rows};
        width: 100%;
      }
      .panel {
        position: relative;
        border-radius: 6px;
        border: 1px solid rgba(0,0,0,0.25);
        cursor: pointer;
        overflow: hidden;
        display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
        transition: transform .12s ease, filter .12s ease;
      }
      .panel:hover { transform: translateY(-1px); filter: brightness(1.05); }
      .panel .cells {
        position: absolute; inset: 3px;
        background-image:
          linear-gradient(rgba(0,0,0,0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.18) 1px, transparent 1px);
        background-size: 50% 25%;
        pointer-events: none;
      }
      .panel.landscape .cells { background-size: 25% 50%; }
      .reading {
        position: relative; z-index: 1; text-align: center;
        background: rgba(0,0,0,0.45); color: #fff;
        padding: 2px 6px; border-radius: 5px; line-height: 1.1;
        backdrop-filter: blur(1px);
      }
      .reading .value { font-weight: 700; font-size: 0.95rem; }
      .reading .unit { font-size: 0.7rem; margin-left: 2px; opacity: .9; }
      .plabel {
        position: absolute; top: 3px; left: 5px; z-index: 1;
        font-size: 0.65rem; color: rgba(0,0,0,0.6); font-weight: 600;
      }
      .empty { padding: 24px; text-align: center; color: var(--secondary-text-color); }
    `;
  }
}

/* =====================================================================
 * The visual editor (drag & drop)
 * ===================================================================== */
class SolarLayoutCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._drag = null;
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._config.panels = this._config.panels || [];
    this._config.reference = this._config.reference || 400;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this._render();
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

  _addPanel() {
    this._config.panels.push({
      id: uid(),
      x: 0,
      y: 0,
      orientation: "portrait",
      entity: "",
      label: String(this._config.panels.length + 1),
    });
    this._emit();
    this._render();
  }

  _removePanel(id) {
    this._config.panels = this._config.panels.filter((p) => p.id !== id);
    this._emit();
    this._render();
  }

  _updatePanel(id, patch) {
    const p = this._config.panels.find((x) => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
    this._emit();
    this._render();
  }

  _render() {
    if (!this._config) return;
    const cols = 16, rows = 16;
    const entities = this._entityList();

    const panelsHtml = this._config.panels
      .map((p) => {
        const w = p.orientation === "landscape" ? PANEL_H : PANEL_W;
        const h = p.orientation === "landscape" ? PANEL_W : PANEL_H;
        return `
          <div class="epanel ${p.orientation}"
               data-id="${p.id}"
               style="left:${p.x * GRID}px; top:${p.y * GRID}px;
                      width:${w * GRID}px; height:${h * GRID}px;">
            <span class="tag">${p.label || ""}</span>
          </div>`;
      })
      .join("");

    const rowsHtml = this._config.panels
      .map((p) => {
        const opts = entities
          .map((e) => `<option value="${e}" ${e === p.entity ? "selected" : ""}>${e}</option>`)
          .join("");
        return `
          <div class="prow" data-id="${p.id}">
            <input class="lbl" type="text" value="${p.label || ""}" placeholder="label" />
            <select class="ent">
              <option value="">— sensor —</option>
              ${opts}
            </select>
            <button class="orient">${p.orientation === "landscape" ? "⇋ landscape" : "⇅ portrait"}</button>
            <button class="del" title="verwijderen">✕</button>
          </div>`;
      })
      .join("");

    this.shadowRoot.innerHTML = `
      <style>${SolarLayoutCardEditor.styles(cols, rows)}</style>
      <div class="wrap">
        <div class="field">
          <label>Titel</label>
          <input id="title" type="text" value="${this._config.title || ""}" />
        </div>
        <div class="field">
          <label>Referentie (Wp/W voor kleurschaal)</label>
          <input id="reference" type="number" value="${this._config.reference}" />
        </div>

        <div class="canvaswrap">
          <div class="hint">Sleep de panelen. Snapt op een raster.</div>
          <div class="canvas">${panelsHtml}</div>
        </div>

        <button id="add" class="add">+ Paneel toevoegen</button>

        <div class="list">${rowsHtml || `<div class="muted">Nog geen panelen.</div>`}</div>
        <div class="ver">solar-layout-card v${VERSION}</div>
      </div>
    `;

    const sr = this.shadowRoot;
    sr.getElementById("title").addEventListener("input", (e) => {
      this._config.title = e.target.value; this._emit();
    });
    sr.getElementById("reference").addEventListener("input", (e) => {
      this._config.reference = Number(e.target.value) || 400; this._emit();
    });
    sr.getElementById("add").addEventListener("click", () => this._addPanel());

    sr.querySelectorAll(".prow").forEach((row) => {
      const id = row.getAttribute("data-id");
      row.querySelector(".lbl").addEventListener("input", (e) =>
        this._updatePanel(id, { label: e.target.value }));
      row.querySelector(".ent").addEventListener("change", (e) =>
        this._updatePanel(id, { entity: e.target.value }));
      row.querySelector(".orient").addEventListener("click", () => {
        const p = this._config.panels.find((x) => x.id === id);
        this._updatePanel(id, {
          orientation: p.orientation === "landscape" ? "portrait" : "landscape",
        });
      });
      row.querySelector(".del").addEventListener("click", () => this._removePanel(id));
    });

    this._wireDrag();
  }

  _wireDrag() {
    const canvas = this.shadowRoot.querySelector(".canvas");
    canvas.querySelectorAll(".epanel").forEach((el) => {
      el.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        el.setPointerCapture(ev.pointerId);
        const id = el.getAttribute("data-id");
        const p = this._config.panels.find((x) => x.id === id);
        const rect = canvas.getBoundingClientRect();
        this._drag = {
          id, el,
          offX: ev.clientX - rect.left - p.x * GRID,
          offY: ev.clientY - rect.top - p.y * GRID,
          rect,
        };
        el.classList.add("dragging");
      });
      el.addEventListener("pointermove", (ev) => {
        if (!this._drag || this._drag.id !== el.getAttribute("data-id")) return;
        const { rect, offX, offY } = this._drag;
        const x = clamp(Math.round((ev.clientX - rect.left - offX) / GRID), 0, 30);
        const y = clamp(Math.round((ev.clientY - rect.top - offY) / GRID), 0, 30);
        el.style.left = x * GRID + "px";
        el.style.top = y * GRID + "px";
        this._drag.x = x; this._drag.y = y;
      });
      el.addEventListener("pointerup", () => {
        if (!this._drag) return;
        const { id, x, y } = this._drag;
        el.classList.remove("dragging");
        this._drag = null;
        if (x != null) this._updatePanel(id, { x, y });
      });
    });
  }

  static styles(cols, rows) {
    return `
      .wrap { display:flex; flex-direction:column; gap:12px; padding:4px; }
      .field { display:flex; flex-direction:column; gap:4px; }
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
        border-radius:6px; touch-action:none;
      }
      .epanel {
        position:absolute; box-sizing:border-box;
        background:hsl(48,70%,60%); border:1px solid rgba(0,0,0,.35);
        border-radius:4px; cursor:grab; touch-action:none;
        display:flex; align-items:center; justify-content:center;
      }
      .epanel.dragging { cursor:grabbing; filter:brightness(1.1); z-index:5; }
      .epanel .tag { font-size:.7rem; color:rgba(0,0,0,.7); font-weight:600; }
      .add { align-self:flex-start; cursor:pointer; }
      .list { display:flex; flex-direction:column; gap:6px; }
      .prow { display:grid; grid-template-columns: 70px 1fr auto auto; gap:6px; align-items:center; }
      .prow .lbl { width:100%; }
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
