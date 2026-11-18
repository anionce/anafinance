# Cala

A personal finance app: import bank statements, categorize spending, track budgets per category and period, and follow savings goals. Available in Spanish and English.

**Stack:** Vite + React 19 + TypeScript · MUI + MUI X DataGrid · Recharts · zustand · Firebase (Auth + Firestore) · SheetJS (xlsx) · pdf.js · Vitest + Testing Library.

## Features

- **Bank imports:** BBVA Excel/PDF statements are recognized automatically, in Spanish or Catalan. Any other spreadsheet can be imported by mapping its columns by hand. Re-importing the same file never duplicates movements.
- **Categorization:** built-in keyword rules plus user rules. A rule can also credit a savings goal.
- **Budgets:** weekly, monthly, bimonthly, every N months or yearly. Each month keeps a snapshot, so past months show the budget that was active then.
- **Review:** new movements without a category are queued for review.
- **Dashboard:** budget status, monthly balance, income vs. estimate, featured goal and insights.
- **Split movements** across several categories.

## Structure

```
src/
  components/
    budget/        budget editor, history, categories and rules dialogs
    dashboard/     dashboard cards
    goals/         savings goals
    layout/        header pieces, account drawer, settings dialogs
    onboarding/    onboarding steps
    transactions/  table, grid, mobile cards, calendar, import and split dialogs
  hooks/           reusable hooks (inline editing, dialog reset, sorted categories)
  i18n/            translations (es / en)
  pages/           routed pages
  services/        domain logic: parsing, categorizing, budgets, insights, Firestore access
  store/           zustand stores: auth, finance, settings, UI, locale, toast
  test/            test setup and factories
  theme/           MUI theme and colors
  types/           domain types
  utils/           pure helpers: dates, calendar, budget drafts, splits, CSV
```

Pure logic lives in `services/` and `utils/` so it can be tested without React or Firebase.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the web config of your Firebase project (Authentication with Google sign-in and Firestore enabled). Publish `firestore.rules`, which lets each user read and write only their own data.

When deploying (Netlify), set the same `VITE_FIREBASE_*` variables in the site's environment settings.

## Scripts

| Script               | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the dev server                  |
| `npm test`           | Run the test suite once               |
| `npm run test:watch` | Run tests in watch mode               |
| `npm run typecheck`  | Type-check the project                |
| `npm run lint`       | Lint with ESLint                      |
| `npm run format`     | Format with Prettier                  |
| `npm run build`      | Type-check and build for production   |

## Tests

Vitest + Testing Library on jsdom. Unit tests cover the domain logic (dates, budgets, parsing, categorization, matching, insights, drafts, splits) and component tests cover the main flows from the user's point of view. Firebase and the PDF reader are mocked in `src/test/setup.ts`, and tests never read `.env` files.
