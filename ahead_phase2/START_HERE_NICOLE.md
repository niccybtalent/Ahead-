# Ahead — what you need to do next

You do **not** need to edit the code.

## 1. Put the code in your GitHub `ahead` repo

Open the `ahead` repo you created in GitHub.

Choose:

**Add file → Upload files**

Upload everything inside this Ahead Phase 2 folder, including:

- `app`
- `components`
- `lib`
- `supabase`
- `package.json`
- `proxy.ts`
- the other root files

Commit the upload to `main`.

## 2. Create the Ahead tables in Supabase

Open your Supabase project.

Go to:

**SQL Editor → New query**

Open this file from the code package:

`supabase/migrations/001_initial.sql`

Copy the whole file into the Supabase SQL editor and click **Run**.

## 3. Deploy it from Vercel

Open Vercel.

Choose:

**Add New → Project → Import your `ahead` GitHub repo**

Before clicking Deploy, add these four Environment Variables:

### Supabase

From the Supabase project **Connect** panel:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Anthropic

From Anthropic Console:

`ANTHROPIC_API_KEY`

And add:

`ANTHROPIC_MODEL` = `claude-sonnet-5`

Do **not** paste your Anthropic key into ChatGPT or commit it to GitHub.

Then click **Deploy**.

## 4. Once Vercel gives you the website URL

Open Supabase:

**Authentication → URL Configuration**

Set **Site URL** to your Vercel URL.

Under **Redirect URLs**, add:

`https://YOUR-VERCEL-DOMAIN/auth/callback*`

Then the magic-link “Save my plan” flow will work.

## 5. Test Ahead

Open your Vercel website and complete the assessment as yourself.

This version now makes two real Claude calls:

1. Ahead diagnoses your current state → target state gap.
2. Ahead uses that diagnosis to build the 10-week roadmap.

The most important thing to assess is whether the result feels genuinely specific to you rather than merely impressive-sounding.
