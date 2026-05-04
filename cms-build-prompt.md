# Build Prompt: Eurorack Learning Guide — CMS with Journal

## What to Build

Convert the static `index.html` file in this directory into a full-stack Next.js application deployed on Vercel via GitHub. The app preserves the existing homepage exactly and adds a journal section with a WYSIWYG editor and full CRUD via a password-protected admin interface. Entries are stored in a Supabase Postgres database.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Hosting | Vercel — auto-deploy from GitHub `main` branch |
| Database | Supabase (Postgres) |
| WYSIWYG | TipTap (React, MIT) |
| Styling | Existing CSS design system from `index.html` (do not introduce Tailwind or a CSS framework) |
| Auth | Simple middleware-based password gate using an env var (`ADMIN_PASSWORD`) |

---

## Repository Structure

```
/
├── app/
│   ├── layout.tsx               # Root layout — DM Mono + DM Sans fonts, body noise/scanline CSS
│   ├── page.tsx                 # Homepage — exact content from index.html
│   ├── journal/
│   │   └── page.tsx             # Public journal listing (newest first)
│   ├── journal/[slug]/
│   │   └── page.tsx             # Public single entry view
│   └── admin/
│       ├── layout.tsx           # Admin layout — password gate middleware
│       ├── page.tsx             # Entry list with edit/delete actions
│       ├── new/
│       │   └── page.tsx         # New entry form (TipTap editor)
│       └── edit/[id]/
│           └── page.tsx         # Edit entry form (TipTap editor, pre-populated)
├── components/
│   ├── JournalEditor.tsx        # TipTap WYSIWYG component (client component)
│   ├── EntryCard.tsx            # Journal entry card for listing
│   └── ThemeToggle.tsx          # Dark/light mode toggle button (client component)
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── auth.ts                  # Admin auth helper (checks cookie vs ADMIN_PASSWORD)
├── middleware.ts                # Protects /admin/* routes
├── public/                      # Static assets
├── styles/
│   └── globals.css              # CSS variables and shared styles ported from index.html
├── .env.local.example           # SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_PASSWORD
└── supabase/
    └── migrations/
        └── 001_journal.sql      # Initial schema
```

---

## Database Schema

```sql
-- supabase/migrations/001_journal.sql
create table journal_entries (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  body        text not null,          -- HTML string from TipTap
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on journal_entries (created_at desc);
```

The `slug` is auto-generated from the title (kebab-case, collision-safe with a short UUID suffix if needed).

---

## Visual Design

The entire app must use the existing design system from `index.html`. Extract it into `styles/globals.css`. Key tokens:

```css
/* Dark mode (default) */
:root {
  --bg: #0d0d0f;
  --bg2: #131316;
  --bg3: #1a1a1f;
  --border: rgba(255,255,255,0.07);
  --border-bright: rgba(255,255,255,0.15);
  --text: #e8e6e0;
  --text-muted: #7a7870;
  --text-dim: #4a4845;
  --accent: #c8f0a0;       /* green */
  --accent2: #a0d4f0;      /* blue */
  --accent3: #f0c0a0;      /* orange */
  --accent4: #d0a0f0;      /* purple */
  --mono: 'DM Mono', monospace;
  --sans: 'DM Sans', sans-serif;
}

/* Light mode overrides */
[data-theme="light"] {
  --bg: #f5f3ef;
  --bg2: #ede9e3;
  --bg3: #e4dfd6;
  --border: rgba(0,0,0,0.08);
  --border-bright: rgba(0,0,0,0.18);
  --text: #1c1b18;
  --text-muted: #5a5752;
  --text-dim: #9a9690;
  --accent: #3d6b14;       /* green — darkened for contrast on light bg */
  --accent2: #1a5a8a;      /* blue */
  --accent3: #8a4010;      /* orange */
  --accent4: #622896;      /* purple */
}
```

The noise texture overlay and scanline effect from `index.html` must be present on all pages via `layout.tsx`. In light mode the scanline opacity should be halved so it reads as a subtle paper texture rather than a screen effect. All UI elements (buttons, inputs, tables, cards) must match the existing minimal aesthetic — no bright colors, no rounded-heavy components, monospace labels, muted interactive states.

---

## Dark/Light Mode

### Theme application

Apply the theme via a `data-theme` attribute on `<html>`. Dark is the default. The `[data-theme="light"]` block in `globals.css` (above) overrides every token — no component-level theme logic is needed since everything already uses CSS variables.

Also respect `prefers-color-scheme` as the initial fallback when no stored preference exists:

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* same values as [data-theme="light"] block */
  }
}
```

### Preventing flash of wrong theme (FOUC)

In `app/layout.tsx`, inject a blocking inline `<script>` as the very first child of `<head>` — before any stylesheets load. This script reads `localStorage.getItem('theme')` and, if set, applies `document.documentElement.setAttribute('data-theme', value)` synchronously. Without this, users with a stored light preference will see a dark flash on every page load.

```ts
// layout.tsx — inside <head>, before font links
<script
  dangerouslySetInnerHTML={{
    __html: `(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})();`
  }}
/>
```

### ThemeToggle component

Create `components/ThemeToggle.tsx` as a `"use client"` component. It reads and writes `localStorage` and toggles the `data-theme` attribute on `<html>`.

**Behaviour:**
1. On mount, read `document.documentElement.getAttribute('data-theme')` to determine the active theme (the inline script above has already applied it, so this is always correct)
2. On click, toggle between `'dark'` and `'light'`, update the attribute, and persist to `localStorage`
3. Render a single `<button>` — no icon libraries. Use text labels only:
   - In dark mode: label is `light` (clicking switches to light)
   - In light mode: label is `dark` (clicking switches to dark)
4. Style: `font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); background: none; border: none; cursor: pointer; padding: 0;`
5. Hover state: `color: var(--text)`
6. No transition animations on the button itself — the theme transition is handled globally (see below)

### Theme transition

In `globals.css`, add a smooth transition for background and color changes across the whole document:

```css
*, *::before, *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
```

Exclude this transition during initial page load to avoid animating the FOUC-prevention script's attribute set. Do this by adding a `no-transition` class to `<html>` in the inline script, removing it after a `requestAnimationFrame`:

```js
(function(){
  var t=localStorage.getItem('theme');
  if(t) document.documentElement.setAttribute('data-theme',t);
  document.documentElement.classList.add('no-transition');
  requestAnimationFrame(function(){ document.documentElement.classList.remove('no-transition'); });
})();
```

```css
.no-transition *, .no-transition *::before, .no-transition *::after {
  transition: none !important;
}
```

### Toggle placement

Place `<ThemeToggle />` in the site footer (right-aligned, beside the existing `modulargrid.net` link). It should also appear in the admin layout header for convenience.

---

## Homepage (`app/page.tsx`)

Convert the `index.html` content into a Next.js page component. The output must be visually pixel-for-pixel identical to the original static file:

- Header with eyebrow, h1, subtitle, and meta row
- Phase navigation bar (anchor links to sections)
- Core mindset shifts grid (4 cards)
- Section divider
- Four phase sections (Phase 01–04) with collapsible technique accordions
- Module reference section with search input, category filter buttons, and the full 87-module data table
- Footer

The accordion expand/collapse JavaScript from `index.html` should be ported to React state (`useState` per technique item). The module search/filter should be ported to React state as well. The intersection observer scroll animations should be re-implemented with a `useEffect`-based observer.

Add a "Journal" link to the site navigation — place it as a new item in the page header alongside the existing meta row, or as a standalone nav link below the header, styled in `--mono` at 11px matching the rest of the header.

---

## Public Journal Pages

### `/journal` — Listing

- Page title: `Journal` in the same `phase-title` style
- Eyebrow: `PATCH / SESSION NOTES` in `header-eyebrow` style
- Entries listed newest-first, each as a card with:
  - `created_at` formatted as `YYYY-MM-DD` in `--mono --text-dim`
  - Entry title in `--mono --text` at 16px
  - First ~200 characters of body text (strip HTML tags), truncated with ellipsis
  - "Read →" link in `--mono --accent` 11px
- Empty state: `no entries yet` centered in `--mono --text-dim`

### `/journal/[slug]` — Single Entry

- Title as `h1` matching the `phase-title` style
- Date in `--mono --text-dim` below the title
- Body HTML rendered inside a `.entry-body` div — style this container so that `<p>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<blockquote>`, `<h2>`, `<h3>` all inherit the design system fonts and colors
- "← Journal" back link in `--mono --text-dim` at top

---

## Admin Interface (`/admin/*`)

### Auth

Protect all `/admin` routes in `middleware.ts`. On first visit, show a minimal password prompt form (no UI framework — just a centered `<form>` with one `<input type="password">` and a submit button, styled to match the design system). On correct submission, set an `HttpOnly` session cookie (`admin_session=1`, 7-day expiry) and redirect to `/admin`. Wrong password shows an inline `— incorrect —` error in `--mono --accent3`.

The `ADMIN_PASSWORD` value comes from an environment variable. Never hardcode it.

### `/admin` — Entry List

- Table matching the existing module table style (same borders, `--bg2` header, hover states)
- Columns: Date | Title | Actions
- Actions: `edit` link (→ `/admin/edit/[id]`) and `delete` button — both in `--mono` 11px
- Delete should trigger a confirmation (`window.confirm`) then call a Server Action to delete the row, then re-render
- "New entry →" button in the top-right corner of the table header, styled as a `cat-btn`-like button

### `/admin/new` and `/admin/edit/[id]` — Entry Form

Both pages use the same `<EntryForm>` component pattern:

**Title field**
- `<input type="text">` styled as `.module-search` from the design system
- Label: `TITLE` in `--mono 10px --text-dim letter-spacing 0.12em`

**Body field**
- TipTap WYSIWYG editor (`JournalEditor.tsx` — a `"use client"` component)
- Toolbar: Bold, Italic, Heading 2, Heading 3, Bullet list, Ordered list, Blockquote
- Toolbar styled as a row of small buttons matching `cat-btn` style
- Editor content area: `--bg2` background, `1px solid var(--border)` border, `--text` color, `--sans` font, `16px`, min-height `300px`, `16px` padding
- Editor focus state: `border-color: var(--border-bright)`
- TipTap output is stored as HTML string

**Save / Cancel**
- "Save entry" primary button: `background: rgba(200,240,160,0.1); border: 1px solid var(--accent); color: var(--accent)` — matching the `.cat-btn.active` style
- "Cancel" secondary link back to `/admin` in `--text-dim`
- On save: call a Server Action that upserts the entry, then `redirect('/admin')`

**Slug generation (new entries only)**
Auto-generate from title on the server at save time: lowercase, replace spaces and special chars with `-`, strip consecutive dashes, append `-` + first 6 chars of the UUID if there's a slug collision.

---

## Environment Variables

```
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_PASSWORD=
```

Document in a `README.md` (create it):
1. Create a Supabase project and run `supabase/migrations/001_journal.sql` in the SQL editor
2. Copy `.env.local.example` to `.env.local` and fill in values
3. `npm install && npm run dev`
4. For Vercel: add the same three env vars in the Vercel project settings, connect to the GitHub repo, and deploy

---

## Data Access Pattern

Use Supabase's JS client (`@supabase/supabase-js`) in Server Components and Server Actions. Do not use the Supabase client in client components — data fetching and mutations happen server-side only. The `JournalEditor` component is the only client component; it receives `initialContent` as a prop and calls an `onChange` callback to bubble the HTML string up to its parent form.

---

## What NOT to Do

- Do not introduce Tailwind, shadcn, Radix, or any component library
- Do not add authentication beyond the single env-var password gate
- Do not add image upload, tags, categories, or pagination in the first version
- Do not change the homepage visuals — it must be identical to the original `index.html`
- Do not use `pages/` router — use App Router only
- Do not add analytics, SEO meta tags, or OpenGraph in the first version
- Do not use `next-themes` or any third-party theme library — implement the toggle directly as specified above
