# solar-layout-card v1.12.1

## Fixed

- The time slider didn't fetch history for "extra sensors" added under "Merge with
  panel" — only panels' and inverters' main sensors were included. Scrubbing back
  in time showed "no history" for those extra sensors instead of their value at
  that point in time. They're now included in the history fetch too.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
