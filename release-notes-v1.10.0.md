# solar-layout-card v1.10.0

## Added

- Fifth display option for (micro-)inverters: **Merge with panel** (`merge`). Instead
  of a separate badge icon or text tile, the inverter's main sensor and any extra
  sensors are folded directly into the same Watt-value pill as the attached panel
  (e.g. "401 W · 1.74 A · 51°C"). Like "Badge on panel", it only takes effect once a
  panel is attached, and any existing wires to that inverter are removed.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
