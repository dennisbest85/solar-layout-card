# solar-layout-card v1.1.7

## Fixed

- **Time slider dragging could freeze mid-drag.** Incoming state updates from Home
  Assistant triggered a full re-render that replaced the slider element while it was
  being held, which dropped the interaction. This happened intermittently, whenever an
  update arrived during a drag.
- The slider now locks re-rendering while it is being dragged and refreshes the panel
  and inverter values in place instead. A full render resumes as soon as you release.
- Added a safety net so the drag lock is always released, even if the mouse or finger is
  lifted outside the slider (common with fast drags), so live updates can never stay
  stuck.

No configuration changes are needed. The time slider behaviour itself is unchanged; it
just drags smoothly now.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
