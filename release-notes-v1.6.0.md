# solar-layout-card v1.6.0

## Added

- Every (micro-)inverter row now has a display dropdown: "Image" (as before), "Text"
  (a compact `label: value` line, no picture), or "Extended data" (a small list
  combining the main sensor with extra ones). Picking "Extended data" reveals an
  inline "+ sensor" list to add extra entity/label pairs — handy when one physical
  micro-inverter has several readings (frequency, current, voltage) you don't want
  as a separate image tile each. The "+ Inverter"/"+ Micro-inverter" buttons now
  have a tooltip explaining this.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
