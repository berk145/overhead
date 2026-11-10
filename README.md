# Overhead

Overhead is a browser-based satellite tracker. Explore satellites on a live globe, inspect their orbits and ground tracks, and predict when the ISS or another low-Earth satellite will pass over your location. The app includes a sky plot, cloud forecast, calendar export, and a simulated clock.

## Data sources

- [CelesTrak GP data](https://celestrak.org/NORAD/elements/): orbital elements for stations, visual satellites, GPS, Starlink, and active satellites. The server fetches cached data from [ReTLEctor](https://retlector.eu/) first, with CelesTrak as a fallback. ReTLEctor refreshes its cache approximately every 12 hours. Each enabled group is cached in server memory for six hours and stale data is retained on upstream failure; the cache is per process and does not survive a restart. CelesTrak fallback requests stop for the lifetime of the process after a non-200 response, in accordance with its usage policy.
- [Open-Meteo](https://open-meteo.com/): city search and hourly cloud-cover forecasts.
- [Where The ISS At?](https://wheretheiss.at/): an independent ISS position used for a cross-check.

## How pass prediction works

1. Convert the selected satellite's CelesTrak orbital elements into an SGP4 model.
2. Propagate positions over the next five days and scan elevation above the observer in 30-second steps.
3. Refine rise and set crossings to one second by bisection.
4. Find the peak elevation with a golden-section search, then sample the path for the sky plot.
5. Classify each pass using satellite illumination and the observer's sun altitude, and show the nearby cloud forecast when available.

## Run and test

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build locally, run `npm run build && npm start`.

```bash
npm run typecheck
npm run lint
npm run test:shard 1/4 & npm run test:shard 2/4 & npm run test:shard 3/4 & npm run test:shard 4/4 & wait
npm run e2e
```

The Playwright smoke test builds and starts the production app by default and uses real APIs. To check an existing local or deployed instance, run `PLAYWRIGHT_BASE_URL=https://your-app.example npm run e2e`. Install the browser first with `npx playwright install chromium` if needed.

## Known limits

Pass predictions are limited to low-Earth orbits and depend on the age and accuracy of orbital elements. Visual magnitude, reverse geocoding, Starlink shell filtering, radio frequencies, Doppler, element history, decay forecasts, and notifications are outside the app's scope. The GP cache is in memory only. Data services and WebGL availability can affect the experience.

The pastel palette follows an OKLCH tonal approach informed by [Radix Colors](https://www.radix-ui.com/colors), [Material Color Utilities](https://github.com/material-foundation/material-color-utilities), and the [Okabe-Ito color scheme](https://jfly.uni-koeln.de/color/).

Third-party asset attribution and licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
