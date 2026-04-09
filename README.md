# Sooraj Sudhakaran Portfolio

<p align="center">
  Robotics, automation, ROS workflows, simulation, industrial engineering, and recruiter-focused portfolio website.
</p>

<p align="center">
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/"><strong>Live Website</strong></a> ·
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/portfolio-overview.html"><strong>Portfolio Overview PDF</strong></a> ·
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/request-cv.html"><strong>Request CV</strong></a> ·
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html"><strong>Feedback and Contact</strong></a>
</p>

<p align="center">
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/">
    <img
      src="https://soorajsudhakaran1199.github.io/sooraj-portfolio/assets/images/readme-preview.png"
      alt="Preview of the Sooraj Sudhakaran portfolio website"
      width="100%"
    />
  </a>
</p>

<p align="center">
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/">
    <img src="https://img.shields.io/badge/Website-Live-0f172a?style=for-the-badge" alt="Website live" />
  </a>
  <a href="https://github.com/SoorajSudhakaran1199/sooraj-portfolio">
    <img src="https://img.shields.io/badge/Deployment-GitHub%20Pages-1f2937?style=for-the-badge" alt="GitHub Pages deployment" />
  </a>
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/request-cv.html">
    <img src="https://img.shields.io/badge/Recruiter-CV%20Request-0b3d2e?style=for-the-badge" alt="Request CV" />
  </a>
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/portfolio-overview.html">
    <img src="https://img.shields.io/badge/Download-Portfolio%20PDF-10233f?style=for-the-badge" alt="Portfolio PDF" />
  </a>
</p>

## Overview

This repository contains the source for the personal portfolio website of Sooraj Sudhakaran. The site is designed to present robotics, automation, simulation, and deployment-facing engineering work in a way that is readable for recruiters, useful for hiring managers, and still detailed enough for technical reviewers.

The portfolio combines:

- a recruiter-friendly homepage with fast role-fit framing
- dedicated project and experience pages
- a structured contact, feedback, and CV-request flow
- a role-aware chatbot assistant
- public review visibility
- a recruiter-ready downloadable portfolio overview
- lightweight operational tracking and admin controls

## What The Portfolio Includes

- homepage with profile summary, role fit, skills, experience, projects, reviews, and contact paths
- detailed pages for thesis work, KEBA experience, robotics projects, VR/simulation work, controls work, and design work
- journey page showing the India-to-Germany academic and professional path
- feedback and contact page with mode-based workflow
- dedicated CV request page
- recruiter-ready portfolio overview page with print-to-PDF download path
- bilingual English and German interface support
- private admin controls for site operations and chatbot log review

## Main Entry Points

- Live homepage: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/`
- Portfolio map: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/portfolio-map.html`
- Recruiter portfolio overview: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/portfolio-overview.html`
- Journey page: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/journey.html`
- Industrial robotics thesis: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/experience-masters-thesis-keba.html`
- Feedback and contact: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html`
- CV request: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/request-cv.html`

## Best Fit

This portfolio is especially relevant for:

- robotics engineer roles
- automation engineer roles
- ROS or robotics software roles
- simulation and digital-twin related work
- controls and mechatronics engineering roles
- industrial robotics thesis, internship, and early-career engineering opportunities

Strong profile signals presented across the site:

- industrial robotics exposure through KEBA Group
- thesis work linked to planning-to-deployment workflows
- ROS and autonomous robotics projects
- simulation, optimization, VR, and systems-focused engineering work
- recruiter-ready contact and PDF download paths

## Languages And Stack

### User-facing languages

- English
- German

### Implementation languages and formats

- HTML
- CSS
- JavaScript
- JSON
- SQL
- Python

### Services and tools

- GitHub Pages
- Supabase Auth
- Supabase Postgres / RPC / REST
- Web3Forms
- Google Analytics 4
- Microsoft Clarity

## Architecture

This is a static multi-page portfolio with a lightweight service layer.

### Frontend

- root HTML pages define the public portfolio pages
- `style.css` holds the main visual system, responsive behavior, print styling, and chatbot styling
- `app.js` handles translations, UI behavior, analytics hooks, forms, admin controls, chatbot logic, and client-side integrations
- `site/` is a generated mirror for deployment and should be refreshed from root with `node scripts/sync_site.mjs`

### Service layer

- `Web3Forms` handles direct message and CV request delivery
- `Supabase` handles authenticated admin features, shared submission events, and chatbot session storage
- analytics tools measure traffic and interaction behavior

### Operational model

- visitors use public pages, forms, review flows, and chatbot guidance
- recruiters can use the CV request path and recruiter-ready PDF overview
- admin mode unlocks private review, summary, and chatbot log controls after authentication

## Chatbot Assistant

The portfolio includes a role-aware assistant built into the website.

It supports:

- recruiter, student, and general-visitor guidance paths
- direct website Q&A routing
- English and German responses
- CV request guidance
- direct contact guidance
- recruiter-level redirects for hiring-only questions
- privacy/info panel inside the chat UI
- chat transcript storage for admin review

Current practical chatbot scope:

- answers portfolio, project, education, experience, review, and contact questions
- handles greetings, small talk, direct navigation help, and common visitor questions
- blocks abusive input and restricts confidential requests
- offers official routes for CV, contact, email, and portfolio download

Current limitations:

- no direct image upload or image processing inside the chat yet
- no live direct conversation with Sooraj inside the chat
- some hiring-specific answers are intentionally limited to recruiter context

## Portfolio Overview PDF

The repository includes a recruiter-ready portfolio overview page:

- `portfolio-overview.html`
- print-friendly layout
- intended for browser `Print -> Save as PDF`
- focused on profile summary, education, experience, projects, skills, certifications, and contact links

This is different from the CV request flow:

- `portfolio overview` is a public recruiter-facing summary
- `CV request` is the controlled route for requesting the latest CV directly from Sooraj

## Feedback, Contact, And CV Request Flows

### Feedback and contact

The feedback page supports two professional workflows inside one structured interface:

- website feedback, corrections, design suggestions, and reviews
- direct professional contact messages

The mode changes labels, hints, and required fields so the same page can support both kinds of submissions cleanly.

### CV request

The CV request page is separate because recruiter intent is different from a normal contact message. It is designed to reduce friction and capture the basic information needed for a CV request clearly.

## Supabase Data Layer

The project currently includes two main SQL-backed operational layers:

- `supabase/portfolio_submission_events.sql`
  - shared submission event tracking for feedback, contact, and CV requests
- `supabase/portfolio_help_bot_sessions.sql`
  - chatbot session storage and admin-side chatbot log review

Supabase is also used for:

- admin authentication
- private admin access checks
- chatbot log inspection and deletion

## Privacy And EU-Facing Notes

The chatbot and site include a practical privacy and transparency layer.

Current visible handling includes:

- chatbot privacy note and info panel
- chat-log storage disclosure inside the chatbot
- deletion-request route through contact
- confidential-data boundary replies for passwords, private credentials, and other restricted information
- AI assistant transparency in the chat UI

The chatbot also contains user-facing guidance for EU/GDPR-style questions, including general references to:

- GDPR
- ePrivacy
- EU AI Act transparency direction

This repository is not legal advice, but the project is structured to be transparent about chat logging, contact handling, and admin-side access.

## Admin Mode

Admin mode is a private operational layer on top of the public portfolio.

It is used for:

- private submission summary review
- chatbot session inspection and deletion
- website maintenance/update controls
- shared activity visibility

Admin access is unlocked only after successful authentication through Supabase Auth and approved admin-session checks.

## Analytics And Operational Insight

The site uses analytics and shared event tracking for two different purposes.

### Visitor behavior analytics

Measured through:

- Google Analytics 4
- Microsoft Clarity

Used for:

- traffic measurement
- navigation and click behavior
- CTA tracking
- heatmaps and session behavior review

### Submission-level operational insight

Used for:

- feedback/contact/CV event counting
- country-level submission visibility
- review-related totals and summary signals
- operational tracking without building a heavy backend dashboard

## Repository Structure

```text
.
├── README.md
├── app.js
├── style.css
├── index.html
├── journey.html
├── portfolio-map.html
├── portfolio-overview.html
├── feedback.html
├── feedback-thank-you.html
├── request-cv.html
├── experience-*.html
├── project-*.html
├── assets/
│   ├── data/
│   │   └── help-bot-question-bank.json
│   ├── images/
│   └── documents/
├── scripts/
│   ├── responsive_audit.mjs
│   ├── animation_audit.mjs
│   └── legacy/
├── supabase/
│   ├── portfolio_submission_events.sql
│   └── portfolio_help_bot_sessions.sql
└── site/
    ├── README.md
    ├── app.js
    ├── style.css
    ├── index.html
    ├── portfolio-overview.html
    ├── feedback.html
    ├── request-cv.html
    ├── assets/
    └── project and experience page mirrors
```

## Root And `site/` Mirror

This repository contains both:

- the main root website files
- a mirrored `site/` copy

When changing shared UI or chatbot logic, the main mirrored files should stay aligned, especially:

- `app.js` and `site/app.js`
- `style.css` and `site/style.css`
- `assets/data/help-bot-question-bank.json` and `site/assets/data/help-bot-question-bank.json`

## Local Development

This project does not depend on a heavy build system for normal editing.

Typical local workflow:

1. edit the relevant HTML, CSS, JS, JSON, or SQL files
2. open the site locally with a static server
3. test the public pages, forms, chatbot, and responsive layout
4. keep root and `site/` mirrored files in sync where required
5. commit and push to `main`

Useful places to edit:

- `app.js` for chatbot, admin logic, analytics hooks, and UI behavior
- `style.css` for layout, motion, visual design, print styling, and chat UI
- `assets/data/help-bot-question-bank.json` for chatbot phrasing and question coverage
- `portfolio-overview.html` for recruiter PDF/download content
- `supabase/*.sql` for data-layer changes

## Deployment

The project is designed for GitHub Pages deployment.

Practical deployment model:

1. keep the repository files current
2. push to `main`
3. allow GitHub Pages to redeploy
4. verify the public site, chatbot behavior, and portfolio-download flow

If the deployment setup uses the mirrored `site/` layer, keep that structure aligned before pushing.

## Contact

For professional contact, collaboration, portfolio review, or recruiter outreach:

- Email: [soorajsudhakaran1199@gmail.com](mailto:soorajsudhakaran1199@gmail.com)
- LinkedIn: [Open LinkedIn profile](https://www.linkedin.com/in/sooraj-sudhakaran1999)
- GitHub: [Open GitHub profile](https://github.com/SoorajSudhakaran1199)
- Contact form: [Open contact form](https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html?type=contact#feedback-form)
- CV request: [Open CV request page](https://soorajsudhakaran1199.github.io/sooraj-portfolio/request-cv.html)

## Maintenance Notes

- keep public URLs stable when possible
- keep English and German content aligned
- keep root and `site/` mirrored files aligned where applicable
- place new chatbot questions in the shared question-bank structure
- treat Supabase SQL changes as part of the real production behavior, not only documentation
- test print/PDF output after changing `portfolio-overview.html` or print styles

## Share Feedback Or Review

Professional feedback is welcome, especially on:

- recruiter clarity
- technical presentation
- website usability
- chatbot quality
- project communication
- portfolio download quality

Best feedback path:

- `https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html`
