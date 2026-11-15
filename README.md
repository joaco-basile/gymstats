# GymStats

Personal PWA to calculate daily calories, log food from your own catalog, and build gym routines.
No backend: all data is stored on the device (IndexedDB) and the app works offline.

## Features

- **Profile**: daily calorie target (Mifflin-St Jeor × activity factor, ±goal adjustment) and macro split
  (protein 2 g/kg, fat 0.9 g/kg, carbs fill the rest).
- **Foods**: your own catalog, values per 100 g or per unit/portion.
- **Today**: log foods by meal, see calories and macros vs. target, browse previous days.
  Entries store a snapshot, so editing or deleting a food never changes past days.
- **Routines**: routines with ordered exercises (sets, reps, rest, notes).
- **Backup**: export/import all data as JSON (Profile tab). Import replaces everything on the device.

## Languages

English and Spanish. The app picks the first supported language from the browser preferences;
it can be changed in Profile → Language (saved per device).

To add a language:

1. Create `src/shared/i18n/locales/<id>.ts` exporting an object typed as `Messages` (copy `es.ts` as a start).
   TypeScript fails the build if any text is missing.
2. Register it in `LANGUAGES` in `src/shared/i18n/languages.ts` with its label and Intl locale.

Domain code never contains UI text; components read copy with `const { t } = useI18n()`.

## Development

```bash
npm install
npm run dev       # dev server
npm test          # unit tests (Vitest)
npm run lint
npm run build     # production build with service worker in dist/
npm run preview   # serve the production build locally
```

Regenerate icons with `node scripts/generate-icons.mjs`.

## Installing on a phone

A PWA must be served over HTTPS to be installable. Deploy `dist/` to any static host
(GitHub Pages, Netlify, Cloudflare Pages, Vercel). The host only serves files; it never sees your data.
Then open the URL on the phone and use "Add to Home Screen" (iOS Safari) or "Install app" (Android Chrome).

## Structure

```
src/
  features/
    calories/   domain/energy.ts (pure calculations) + ui/
    nutrition/  domain/nutrition.ts (pure calculations) + ui/
    routines/   domain/routine.ts + ui/
  shared/       db.ts (Dexie/IndexedDB), backup.ts, ui/ (Sheet, NumberInput, BackupPanel)
```
