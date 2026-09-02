# solar-layout-card v1.4.0

## Added

- Editor: an inverter or micro-inverter row now has an "Attach to panel…" dropdown.
  Pick a panel and the inverter snaps to sit just below it, instead of every new
  inverter landing stacked on top of panel 1 where it's hard to grab and separate.
  You can still drag it anywhere afterwards. This sets an optional `panelId` field
  on the inverter, which plain YAML users can ignore.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
