# solar-layout-card v1.11.0

## Changed

- Removed "Extended data" from the display dropdown; "Merge with panel" offers the
  same main-sensor-plus-extras functionality (now shown neatly in the panel's own
  pill instead of a separate text block) and is the recommended replacement.
  Existing inverters with `display: extended` migrate automatically: to `merge` if
  a panel is attached, to `text` otherwise. No data is lost — previously entered
  extra sensors are kept and start working again as soon as you attach a panel and
  switch to "Merge with panel".

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
