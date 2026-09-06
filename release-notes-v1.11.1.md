# solar-layout-card v1.11.1

## Fixed

- A sensor reporting "unknown"/"unavailable" (e.g. a panel that reads nothing
  overnight) showed that raw text as its value. It now reads as "0", the same as
  a sensor that genuinely reports 0. Applies to panels, inverter tiles, "Merge
  with panel", and badge tooltips.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
