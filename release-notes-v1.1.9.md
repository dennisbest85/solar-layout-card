# solar-layout-card v1.1.9

## Fixed

- **Panels sharing the same sensor did not all move with the time slider.** When several
  panels use the same sensor (for example an inverter total divided evenly across panels
  by a manual sensor), only one of them updated while dragging the slider. Values were
  looked up by sensor, which finds only the first matching panel. Panels and inverters are
  now updated by their own unique id, so all panels using the same sensor move together
  with the slider.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
