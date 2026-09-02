# solar-layout-card v1.5.1

## Fixed

- An inverter's panel link (`panelId`) and "show in picture" flag (`badge`), added in
  v1.4.0/v1.5.0, were silently dropped on every config load by an internal function
  that rebuilt inverters from a fixed set of older fields. In practice this meant the
  panel link appeared to reset every time you reopened the editor, and the "show in
  picture" checkbox had no visible effect. Both fields are now preserved.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
