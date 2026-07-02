# Sooraj Sudhakaran Portfolio

Professional portfolio website for Sooraj Sudhakaran, focused on robotics, automation, simulation, and industrial engineering work.

The site is built as a modern static frontend with a lightweight Supabase-backed layer for recommendations, admin-controlled content settings, and email notification workflow.

## Project Overview

This portfolio is designed for technical recruiters, engineering teams, and collaborators who need a clear view of Sooraj's robotics profile. It presents:

- Robotics and automation positioning
- Project case studies with engineering evidence
- KEBA industrial robotics experience
- Education, certifications, and technical skills
- Public professional recommendations
- A portfolio assistant for guided Q&A
- Admin-controlled content settings for selected live sections

The public site is a static build. Dynamic actions such as recommendations and admin updates are handled through Supabase with row-level security.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Supabase REST and Auth
- Supabase Edge Function for recommendation email notification

## Folder Structure

```text
sooraj-sudhakaran-portfolio/
  public/                Static public assets copied into production
  src/                   Application source code
    assets/              Images, certificates, logos, and project media
    components/          UI sections and interactive panels
    context/             Theme, language, and admin state provider
    data/                Portfolio content and assistant knowledge
    hooks/               Reusable interaction hooks
    lib/                 Supabase and state composition services
    pages/               Page-level composition
  supabase/              Database setup and Edge Function source
  dist/                  Production build output after npm run build
  package.json           Project scripts and dependencies
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run lint checks:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The deployable website is the contents of:

```text
dist/
```

For a static host, upload the files inside `dist/`, not the full source folder.

The Vite base path is configured as `./`, so the build can run from a root domain or a project subpath such as GitHub Pages.

Before publishing to a final public URL, confirm these files match the live domain:

- `public/robots.txt`
- `public/sitemap.xml`
- `public/site.webmanifest`
- `public/social-preview.webp`

After editing public metadata, run `npm run build` again so `dist/` receives the updated files.

## Backend Notes

The portfolio uses Supabase for:

- Public recommendations
- Admin review and approval flow
- Portfolio admin state
- Section visibility and content additions
- Recommendation email notification trigger

The frontend contains only the Supabase project URL and publishable browser key. The admin password is not stored in the source code. Admin access is handled through Supabase Auth, and browser sessions are intentionally short-lived.

Database setup for the portfolio admin state is kept in:

```text
supabase/portfolio_admin_state.sql
```

The recommendation notification function is kept in:

```text
supabase/functions/recommendation-notify/
```

Email delivery requires provider credentials to be configured as Supabase Edge Function environment variables. Do not place email API keys, private keys, or service-role keys in the frontend.

## Security Baseline

- No admin password is stored in the repository.
- No service-role key is stored in the frontend.
- Admin sessions clear on refresh and expire after inactivity.
- Public recommendation submissions stay pending until approved.
- Backend updates depend on Supabase Auth and database policies.

## Content Maintenance

Primary portfolio content is managed in:

```text
src/data/portfolioData.js
src/data/siteCopy.js
```

Assistant responses are managed in:

```text
src/data/helpBotKnowledge.js
src/data/helpBotCasualKnowledge.js
src/data/helpBotQuestionBank.json
```

Visual and layout changes are mainly in:

```text
src/index.css
src/components/
```

## Production Checklist

Before upload:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Open `dist/index.html` through a local static server or hosting preview.
4. Check dark and light themes.
5. Check project case-study modals.
6. Check recommendation submission and admin review if Supabase is enabled.
7. Upload only the contents of `dist/`.

## Ownership

This project is maintained as the official portfolio website for Sooraj Sudhakaran.
