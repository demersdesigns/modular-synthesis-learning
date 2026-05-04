# Generative Ambient — Eurorack Learning Guide

A Next.js 14 app with a public journal and password-protected admin interface. Entries are stored in Supabase Postgres.

## Setup

### 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run the contents of `supabase/migrations/001_journal.sql`

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=choose-a-strong-password
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin interface is at `/admin` — first visit redirects to `/admin/login`.

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add the three environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
4. Deploy — Vercel auto-deploys on every push to `main`
