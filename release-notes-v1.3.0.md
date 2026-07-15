# solar-layout-card v1.3.0

## Added

### Time slider playback

The history time slider now has playback controls next to it:

- A **play/pause** button runs through the day at speed, so you can watch the sun move
  across the panels from the start of the range up to live.
- A **rewind** button jumps back to the start of the range (12 hours back).
- The label now shows the actual clock time of the selected moment (e.g. `13:00`) instead
  of "x hours ago".

### Footer bar (weather, expected, total)

An optional footer bar can show the weather, the expected output and the current total. It
is **off by default** and only appears when you configure at least one of the new options:

```yaml
type: custom:solar-layout-card
weather_entity: weather.home
forecast_entity: sensor.solcast_pv_forecast_forecast_now   # or Forecast.Solar
# total_entity: sensor.pv_total   # optional
# show_total: true                # default
```

- `weather_entity` — shows a weather icon and the current condition.
- `forecast_entity` — the expected output, e.g. from Forecast.Solar or Solcast.
- `total_entity` — a sensor for the total. If omitted, the total is auto-summed from the
  panel sensors, counting each unique sensor once (so panels sharing a sensor are not
  double-counted).
- `show_total` — show or hide the auto-summed total (default on).

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
