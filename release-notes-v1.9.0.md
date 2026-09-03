# solar-layout-card v1.9.0

## Fixed

- "Text" and "Extended data" mode tiles were vertically centered within the full
  tile footprint sized for the picture display, leaving a lot of empty space
  around a couple of short lines of text. The tile now hugs its content's height
  instead of centering inside an oversized box.

## Added

- Extra sensors in "Extended data" mode can now be reordered with ↑/↓ buttons in
  the editor, instead of being stuck in the order they were added.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
