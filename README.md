# Sooraj Sudhakaran Portfolio

Official portfolio repository for Sooraj Sudhakaran, focused on robotics, automation, simulation, and industrial engineering work.

This repository contains both the deployed website and the editable source project. The production files are placed at the repository root for direct GitHub Pages hosting, while the maintainable React and Vite source project is kept inside `source/`.

## Overview

The portfolio is built for recruiters, hiring teams, engineering reviewers, and collaborators who need a clear technical view of Sooraj's work. It highlights industrial robotics experience, project case studies, education, certifications, professional recommendations, and a guided portfolio assistant.

The public website is delivered as a static build. Dynamic workflows such as recommendation submission, admin review, section visibility, and notification handling are supported through Supabase.

## Live Repository Layout

```text
.
  index.html                         Production entry page for GitHub Pages
  assets/                            Built CSS, JavaScript, images, PDFs, and media
  Sooraj-Sudhakaran-Resume-Overview.html
  favicon.svg
  robots.txt
  sitemap.xml
  site.webmanifest
  social-preview.webp
  .nojekyll                          Required for direct static hosting on GitHub Pages

  source/                            Editable React/Vite project
```

The root files are the deployed site. The `source/` folder is the working project used for future edits and builds.

## Portfolio Scope

The website presents:

- Robotics and automation positioning
- KEBA industrial robotics experience
- Industrial robot workflow planning and simulation validation
- ROS, SLAM, embedded systems, Unity, MATLAB, and control-system project evidence
- Education, certifications, and practical engineering skills
- Verified professional recommendations
- Resume and contact access
- Portfolio assistant for guided Q&A
- Admin-controlled content and recommendation review workflow

## Technical Stack

The editable source project uses:

- React 18
- Vite 5
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Supabase REST and Auth
- Supabase Edge Functions
- ESLint

## Source Project

Work from the `source/` directory:

```bash
cd source
npm install
npm run dev
```

Run checks:

```bash
npm run lint
npm run build
```

The production build is generated at:

```text
source/dist/
```

To publish a new version from source, copy the contents of `source/dist/` to the repository root and commit the updated root files.

## Deployment Model

GitHub Pages can serve the site directly from the repository root.

Publishing flow:

1. Update content, layout, or assets in `source/`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Copy `source/dist/` contents to the repository root.
5. Confirm `index.html`, `assets/`, `.nojekyll`, `robots.txt`, `sitemap.xml`, and `site.webmanifest` exist at the root.
6. Commit and push to `main`.

The Vite base path is configured as `./`, which allows the built site to work from a root domain or a project path.

## Supabase Integration

Supabase supports the live dynamic workflow:

- Public recommendation submissions
- Admin approval and rejection states
- Admin-controlled section visibility
- Portfolio content state
- Recommendation email notification trigger

Supabase setup and function source are kept in:

```text
source/supabase/
```

The frontend contains only public-safe Supabase configuration. Private credentials, service-role keys, email provider tokens, and Edge Function secrets must stay outside the repository.

## Security Baseline

- No admin password is stored in the repository.
- No service-role key is stored in the frontend.
- Public browser access uses only publishable Supabase credentials.
- Admin access is handled through Supabase Auth.
- Admin sessions are intentionally short-lived.
- Public recommendations remain hidden until approved.
- Email provider credentials are expected to live in Supabase environment variables.

Recommended local secret check before release:

```bash
rg -n "password|secret|service_role|api_key|private|token" source
```

Review matches carefully before committing.

## Quality Checklist

Before publishing:

- Lint passes.
- Production build completes.
- Homepage loads without console errors.
- Dark and light modes are checked.
- Mobile, tablet, and desktop layouts are checked.
- Project modals remain readable and correctly spaced.
- Recommendation cards handle long comments without overlap.
- Admin panel opens above page content and remains usable on mobile.
- Chatbot typing, reset, suggestions, and responses work correctly.
- Contact, resume, sitemap, and metadata files are correct.

## Repository Hygiene

Do not commit:

- `node_modules/`
- local `.env` files
- private keys
- service-role keys
- temporary screenshots
- editor folders
- logs

The repository root is reserved for deployable production files. The editable application should remain under `source/`.

## Ownership

This repository is maintained as the official portfolio website for Sooraj Sudhakaran.

Content updates should remain concise, evidence-based, and aligned with robotics, automation, simulation, and industrial engineering roles.
