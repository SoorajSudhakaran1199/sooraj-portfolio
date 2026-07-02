# Sooraj Sudhakaran Portfolio

This repository contains the production website and source project for Sooraj Sudhakaran's robotics, automation, and simulation engineering portfolio.

The live website files are kept at the repository root so GitHub Pages can serve the portfolio directly. The editable React project is kept in `source/`.

## Repository Structure

```text
.
  index.html                         Production entry page
  assets/                            Built CSS, JavaScript, images, PDFs, and media
  Sooraj-Sudhakaran-Resume-Overview.html
  favicon.svg
  robots.txt
  sitemap.xml
  site.webmanifest
  social-preview.webp
  source/                            Editable React/Vite project
```

## Project Scope

The portfolio presents Sooraj's engineering work across:

- Industrial robotics and automation
- Robot workflow planning and simulation validation
- KEBA industrial robotics experience
- ROS, SLAM, embedded systems, and control-oriented projects
- Education, certifications, and professional recommendations
- Admin-controlled live sections and recommendation review workflow

## Technology

The source project uses:

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Supabase REST and Auth
- Supabase Edge Function support for recommendation email notifications

## Local Development

Work from the `source/` directory:

```bash
cd source
npm install
npm run dev
```

Run checks before publishing:

```bash
npm run lint
npm run build
```

The production build is generated in:

```text
source/dist/
```

To publish a new version through this repository, copy the contents of `source/dist/` to the repository root and commit the change.

## Backend Notes

Supabase is used for public recommendations, admin-controlled content state, approval flow, and recommendation notifications.

The frontend contains only the Supabase project URL and publishable browser key. Admin authentication is handled through Supabase Auth. Private API keys, service-role keys, and email provider credentials must stay outside this repository and be configured through Supabase project settings or Edge Function secrets.

Supabase setup files are kept in:

```text
source/supabase/
```

## Security Baseline

- No admin password is stored in the repository.
- No service-role key is stored in the frontend.
- Public recommendations remain pending until approved.
- Admin sessions are intentionally short-lived.
- Email notification credentials are expected to live in Supabase environment variables.

## Production Checklist

Before pushing a website update:

1. Update the content in `source/`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Copy `source/dist/` contents to the repository root.
5. Confirm `index.html`, `assets/`, `robots.txt`, `sitemap.xml`, and `.nojekyll` are present at the root.
6. Commit and push to `main`.

## Ownership

This repository is maintained as the official portfolio website for Sooraj Sudhakaran.
