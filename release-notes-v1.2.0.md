# solar-layout-card v1.2.0

## Added

- **card-mod support.** You can now restyle the card with
  [card-mod](https://github.com/thomasloven/lovelace-card-mod) using the usual
  `card_mod:` / `style:` YAML, for example to change the border, background or shadow:

  ```yaml
  type: custom:solar-layout-card
  card_mod:
    style: |
      ha-card {
        border: 0 !important;
        background: none !important;
        box-shadow: none !important;
      }
  # ... your panels, inverters, etc.
  ```

  The styling is re-applied after every render, so it no longer disappears when the sensor
  values update (which was why card-mod appeared not to work before). If card-mod is not
  installed, the `card_mod:` block is simply ignored.

## Updating

Update via HACS and then do a hard browser refresh (or clear the `.gz` in
`www/community/solar-layout-card/`) if you don't see the change immediately.
