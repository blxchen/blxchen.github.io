# Homepage visual refinement review

This branch is for visual review. The live `main` branch is unchanged.

## Screenshots

| Viewport | Before | After |
| --- | --- | --- |
| 1440 × 900 | [before](before-1440.png) | [after](after-1440.png) |
| 1920 × 1080 | [before](before-1920.png) | [after](after-1920.png) |
| 390 × 844 | [before](before-390.png) | [after](after-390.png) |

Screenshots show the full page at each requested viewport. Lazy images were decoded before capture.

## Five largest visual discrepancies addressed

1. The headline occupied two wide lines and lacked the cyan navigation accent. It now uses the mockup's three-line rhythm, a cyan final word, a short rule, and restrained outlined actions.
2. The satellite in the source photograph was too small to read. An original SVG satellite supplies the upper-right focal point while the full-bleed Earth image remains behind it.
3. The scientific plots formed a tall stacked dashboard. They now occupy a 65% workstation column beside a 35% editorial column with a technical skyline, with the working simulation unchanged.
4. The research cards appeared in an uneven 3+2 arrangement. Five consistent landscape cards now form one desktop row, including an original grayscale urban LEO line-of-sight diagram.
5. Publications lacked a clean academic row hierarchy. Status, title, authors, venue, and arrow now align in compact divided rows, with mobile wrapping repaired.

## CSS conflicts resolved

- `texas-editorial.css` supplied light masthead and old page-specific hero rules after the base styles. The page generator now excludes that sheet from the homepage while retaining it for legacy subpages.
- The older `.academic-paper > span:not(.paper-status):last-child:nth-child(4)` rule forced venue metadata into the arrow column. The homepage style now assigns it to the metadata column at desktop and the single content column on mobile.
- The mobile Research link overlaid the dropdown button. The button now has its own positioned hit area and the link reserves space for it.

## Verification

- `node tools/test-science.js` — passed.
- `node tools/test-site.js` — passed.
- `node tools/test-research-profile.js` — passed.
- JavaScript syntax and `git diff --check` — passed.
- Browser review at 1440 × 900, 1920 × 1080, and 390 × 844 — no page errors or horizontal overflow.
- Browser route check — 26 homepage links and ten representative routes resolved; mobile menu and Research dropdown opened; altitude, SNR, and pause controls responded; contact form remained present.

## Remaining differences from the concept image

The original Earth photograph and custom SVG satellite are distinct from the concept artwork. The urban LEO card uses a vector city schematic because no source city-model asset was provided. Long publication titles and the required eight navigation tabs create denser content than the abbreviated concept image.
