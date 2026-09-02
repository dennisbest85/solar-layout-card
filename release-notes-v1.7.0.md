# solar-layout-card v1.7.0

## Changed

- "Show in picture" is no longer a separate checkbox next to the display dropdown —
  it's now a fourth option in it: **Badge on panel**. An inverter now always has
  exactly one display mode instead of two settings that could silently conflict
  (badge mode used to ignore whatever text/extended display you'd picked).
- Removed the global "Hide image" setting (applied to all inverters). It silently
  overrode a row explicitly set to "Image" mode, which was confusing now that a
  per-inverter "Text" mode exists. Existing configs using this setting migrate
  automatically: an inverter without an explicit display gets "Text" instead of
  suddenly showing its image again after updating.
- Every field on an inverter row (panel, display, brand, label, main sensor, extra
  sensors) now has an explanatory tooltip, and the extra-sensors list has a caption
  clarifying they're shown alongside the main sensor above it. The main sensor field
  also has a clearer placeholder ("main sensor" instead of "search sensor").

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
