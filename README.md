# PH Weather — Responsive Weather Dashboard

PH-first weather app (worldwide locations): current conditions, hourly and
7-day forecasts, rain probability, alerts architecture, charts, favorites,
units, and dark mode.

**Status: feature-complete + preferences polish.** Current weather, worldwide
search, geolocation, favorites with live summaries, 24h hourly + 7-day
forecasts, tabbed Recharts, alert system (derived guidance with permanent
not-official labeling + PAGASA-ready official slot), persisted °C/°F + wind +
pressure + theme settings, and toast confirmation for favorite add/remove. **Phase 9:** PH-hardened —
severe-weather area promoted below the hero with a dedicated official-warnings
card, WHO UV bands, PAGASA adapter skeleton (TCWS + rainfall mappings), and
live-verified search for Manila, Quezon City, Baguio, Cebu City, Davao City,
Iloilo, and Cagayan de Oro. **Phase 10a:** mobile overflow, 40px touch
targets, missing empty states, reduced-motion. **Phase 11a:** APG tabs +
combobox semantics, single live-region toasts, dialog/skeleton announcements,
axe-clean. **Phase 11b:** contrast remediation — adaptive chart palette,
dark-paired icons, slate-500 floors, sky-700 actives, dark focus ring.
**Phase 10b:** visual-consistency polish — EmptyState reuses Card, Lucide
official badge, unified radius (rounded-md controls) and 40px icon buttons,
p-5/p-6 card rule, single footer source line; sky reserved for data
selection, neutral slate kept for the theme mode toggle. **Phase 13:**
production-readiness — narrowed store selectors, surfaced geolocation
naming failures with retry, search retry, scoped favorite retries,
memoized charts, coord range guards, dead-code/rename cleanup, Leaflet
removal (0 vulnerabilities).

## Stack

React 19 + Vite 8 + TypeScript (strict) + Tailwind CSS 3.4 + TanStack Query 5
+ Zustand 4 + Recharts + Lucide + Leaflet/React-Leaflet 5 + date-fns + Zod.
Tests: Vitest + React Testing Library + Playwright (smoke).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

Copy `.env.example` to `.env` to override public API base URLs
(keyless Open-Meteo endpoints — no secrets).

## Verify Phase 1

```bash
npm run typecheck
npm run test       # vitest scaffold tests
npm run build
npx playwright test --list-tests
```

## Philippine users

Tropical-tuned derived-guidance thresholds (see `src/utils/warnings.ts`):

| Category | Trigger |
|---|---|
| Thunderstorm | WMO code 95/96/99 observed or within 24h |
| Heavy rain | Probability ≥ 70% or ≥ 20 mm / 24h (warning at ≥ 90% / ≥ 50 mm) |
| Strong wind | Gusts ≥ 61 km/h |
| Extreme heat | Feels-like ≥ 42°C (PAGASA danger category) |
| High UV | Index ≥ 8 (WHO bands shown: Low/Moderate/High/Very high/Extreme) |

Flooding and typhoon categories exist in types/UI but are never
synthesized — they activate via the official feed only. Official PAGASA
warnings slot into `src/services/alerts/officialAlerts.ts` (TCWS 1–5 and
rainfall-advisory mappings already sketched); the UI renders them with
source attribution and zero code changes.

Verified cities (generic search, nothing hardcoded): Manila, Quezon City,
Baguio (disambiguated from provincial namesakes), Cebu City, Davao City,
Iloilo (disambiguated from PNG namesake via country labels),
Cagayan de Oro.

## Structure

`src/components|pages|services|hooks|store|types|utils|constants|layouts|lib`
— UI, business logic, API services, state, types, utils, and config stay
separate. Weather logic lands in Phase 2+.
