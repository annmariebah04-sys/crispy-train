# ChoreQuest

A sleek, dark-mode chores & rewards app for 3 kids. Built with React, TypeScript, Vite, Tailwind CSS v4, and Framer Motion. Data syncs live across every device through Firebase Firestore — a parent adding a chore on their phone shows up instantly on a kid's phone or tablet.

## Features

- **Kid profiles** — pick an avatar (emoji or an uploaded photo), a background image, a color, and a name for each of the 3 kids.
- **Randomized daily chores** — parents build a shared pool of household chores (wash dishes, sweep, empty the dishwasher, etc.). Every day, the app randomly hands them out across the kids, making sure nobody gets the exact chore they had the day before. A chore can also be pinned to always go to one specific kid instead of the random pool.
- **Noon reset** — the chore day runs on a cycle that ends at **12:00 PM**. A countdown pill shows time left; at noon the board resets and a new day's chores get assigned.
- **Proof required, parent-approved** — to mark a chore done, a kid attaches a photo and/or a written note. It goes into the parent's review queue as **pending** — points are only awarded once a parent taps Approve (or Reject, which sends it back for another try).
- **Points & rewards** — approving a chore awards points. Kids can unlock parent-defined rewards once they have enough points; redemption requests wait for parent approval in the dashboard.
- **Parent dashboard** (PIN-gated, default `1234`) — a "Needs your review" queue front and center for approving/rejecting proof, a chore pool + reward manager, a **History** tab of every past completion (photo/note, points, date, filterable by kid), kid profile management, and PIN settings.
- **Real-time sync** — every device (parent's phone, each kid's phone/tablet) reads and writes the same shared Firestore data, live.

## One-time setup: Firebase

This app needs a free Firebase project so data syncs across devices.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project (no credit card needed).
2. In the project, go to **Build → Firestore Database → Create database** and start it in **production mode** (any region).
3. Go to **Project settings → General → Your apps**, click the `</>` (web) icon, register an app (no need for Firebase Hosting there), and copy the `firebaseConfig` values shown.
4. In this repo, copy `.env.example` to `.env` and paste those values in, plus make up a `VITE_FAMILY_ID` (any private, hard-to-guess string — it namespaces your family's data in Firestore).
5. In the Firebase console, go to **Firestore Database → Rules** and paste in the contents of `firestore.rules` from this repo, then **Publish**.

There's no login system — anyone who knows your `VITE_FAMILY_ID` can read/write your family's data, so treat it like a shared house key rather than something public. See the comment in `firestore.rules` for the exact tradeoff.

## Development

```bash
npm install
npm run dev         # start local dev server (uses your .env Firebase project)
npm run build        # type-check + production build
npm run emulators     # optional: run a local Firestore emulator instead of your real project
                       # (set VITE_USE_FIREBASE_EMULATOR=true in .env to point the app at it)
```

## Deploying so every device can reach it

Any static host works (the build output is plain HTML/CSS/JS). Two options:

### Option A: GitHub Pages (fully on GitHub, free)

This repo already includes `.github/workflows/deploy.yml`, which builds and publishes to Pages automatically on every push. One-time setup:

1. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Go to **Settings → Secrets and variables → Actions → New repository secret** and add each of these (same values as your `.env`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FAMILY_ID`.
3. Push to `main` (or re-run the workflow from the **Actions** tab) — the site publishes to `https://<your-username>.github.io/crispy-train/`.

Every subsequent push rebuilds and redeploys automatically.

### Option B: Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import the repo. Framework preset: Vite.
2. In the Vercel project's **Environment Variables**, add every `VITE_*` value from your `.env`.
3. Deploy — Vercel gives you a public URL every kid's device can open, and redeploys on every push.
