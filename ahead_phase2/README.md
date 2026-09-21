# Ahead — Phase 2

This is the first real Ahead application: the black-tech UI rebuilt in Next.js, a live assessment flow, Claude-powered structured diagnosis + 10-week curriculum generation, and Supabase magic-link auth + plan saving.

## What works now

- Black-tech Ahead landing page
- 12-step assessment
- Live `POST /api/generate`
- Claude structured-output diagnosis
- Second Claude call for the 10-week roadmap
- Results screen populated from real AI output
- Supabase magic-link sign-in
- Row-level-security SQL for assessments / diagnoses / programmes
- Save generated plans to the signed-in user's Supabase account

## Deliberately not in this build yet

- CV/PDF upload
- Resource catalogue
- Detailed Week 1 / daily sessions
- Progress tracking
- Dashboard of saved programmes
- Payments

Those should come after the core diagnosis quality is tested.

## 1. Put this code in GitHub

If your `ahead` repo is empty, the easiest browser route is:

1. Open the repo in GitHub.
2. Choose **Add file → Upload files**.
3. Upload the **contents** of this folder (not the parent folder itself).
4. Commit to `main`.

Or from Terminal:

```bash
git init
git add .
git commit -m "Build Ahead Phase 2"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. Create the Supabase tables

In Supabase:

1. Go to **SQL Editor**.
2. Open `supabase/migrations/001_initial.sql` from this project.
3. Paste it into a new query.
4. Run it.

This creates the three V1 tables and enables RLS so users can only read/write their own rows.

## 3. Deploy in Vercel

1. In Vercel, choose **Add New → Project**.
2. Import the `ahead` GitHub repo.
3. Add these environment variables before deploying:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-5
```

Where to get them:
- Supabase URL + Publishable Key: your Supabase project **Connect** panel.
- Anthropic key: Anthropic Console.

**Never** make `ANTHROPIC_API_KEY` a `NEXT_PUBLIC_` variable.

4. Deploy.

## 4. Configure Supabase magic-link redirects

After Vercel gives you a production URL (for example `https://ahead-xyz.vercel.app`):

In Supabase → Authentication → URL Configuration:

- Set **Site URL** to your Vercel production URL.
- Add your production callback URL to **Redirect URLs**:

```text
https://YOUR-VERCEL-DOMAIN/auth/callback*
```

For local development also allow:

```text
http://localhost:3000/auth/callback*
```

## 5. Run locally (optional)

Copy `.env.example` to `.env.local`, fill in your real values, then:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Product flow

```text
Landing
  ↓
Assessment
  ↓
/api/generate
  ↓
Claude call 1: diagnoseProfile()
  ↓
Claude call 2: generateCurriculum()
  ↓
Results
  ↓
Optional magic-link sign in
  ↓
Save plan to Supabase
```

## Why there are two Claude calls

Ahead should not ask one model prompt to ingest an assessment and vomit out 70 days of content. The product value is the reasoning architecture:

1. diagnose the current → target gap;
2. build the 10-week learning architecture from that diagnosis;
3. next build: generate detailed weeks on demand.

That makes the programme easier to evaluate, cheaper to evolve, and less generic.
