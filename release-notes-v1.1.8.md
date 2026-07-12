# solar-layout-card v1.1.8

## Fixed

- **The time slider did not work on tabs other than the first layout.** History was only
  fetched for the entities of the currently active layout, so panels on another tab showed
  "no history" when travelling back in time. History is now fetched in one call for the
  entities of **all** layouts, so the slider works immediately on every tab. Switching tabs
  fetches any still-missing history as a safety net.

## Added

- A GIF of the history time slider in the README, with a short note that this is a feature
  since v1.1.7.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
