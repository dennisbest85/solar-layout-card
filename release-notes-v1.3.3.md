# solar-layout-card v1.3.3

## Security

- Sensor state, `unit_of_measurement`, the footer weather label, and panel/inverter
  labels were interpolated into the card's HTML unescaped. A sensor whose state or
  unit contains markup (for example a REST, scrape, or MQTT sensor relaying remote
  or LAN data) could execute script in the dashboard's origin. These values are now
  HTML-escaped before being rendered.

## Other

- Removed the unused PNG images under `dist/microinverters/` (~279 KB). The
  micro-inverter icons are already drawn from the inlined base64 images in the
  card itself, so these files were never referenced.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
