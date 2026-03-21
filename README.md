# Sooraj Sudhakaran Portfolio

<p align="center">
  Personal portfolio website focused on robotics, automation, industrial engineering, ROS workflows, simulation, and deployment-oriented engineering work.
</p>

<p align="center">
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/"><strong>Live Website</strong></a> ·
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/journey.html"><strong>Journey</strong></a> ·
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/experience-masters-thesis-keba.html"><strong>Industrial Robotics Thesis</strong></a> ·
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html"><strong>Feedback and Contact</strong></a>
</p>

<p align="center">
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/">
    <img src="site/assets/images/readme-preview.png" alt="Preview of the Sooraj Sudhakaran portfolio website" width="100%" />
  </a>
</p>

<p align="center">
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/">
    <img src="https://img.shields.io/badge/Website-Live-0f172a?style=for-the-badge" alt="Website live" />
  </a>
  <a href="https://github.com/SoorajSudhakaran1199/sooraj-portfolio">
    <img src="https://img.shields.io/badge/Static%20Site-GitHub%20Pages-1f2937?style=for-the-badge" alt="Static site on GitHub Pages" />
  </a>
  <a href="https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html">
    <img src="https://img.shields.io/badge/Contact-Feedback%20Form-0b3d2e?style=for-the-badge" alt="Feedback form" />
  </a>
</p>

## Overview

This repository contains the cleaned source structure for the portfolio website of Sooraj Sudhakaran. The site is built as a static multi-page portfolio with recruiter-facing positioning, structured project detail pages, experience pages, analytics, SEO setup, and a direct feedback and contact workflow.

The portfolio is designed to present:

- robotics and automation profile positioning
- industrial robotics experience and thesis work
- ROS, simulation, controls, and mechatronics projects
- journey and background context
- direct recruiter and collaboration contact paths

## Best Fit

This portfolio is most relevant for:

- robotics engineer roles
- automation engineer roles
- ROS or robotics software engineer roles
- simulation and digital-twin related work
- controls and mechatronics engineering roles
- industrial robotics thesis, internship, and early-career engineering opportunities

Strongest profile signals:

- industrial robotics exposure through KEBA Group
- master's thesis work connected to planning-to-deployment robotics workflows
- ROS and autonomous robotics projects
- simulation, VR, optimization, and systems-oriented engineering work

## Featured Pages

- `Homepage`: recruiter-facing profile, fit summary, projects, reviews, and contact
- `Journey`: academic and professional transition from India to Germany
- `Industrial robotics thesis`: strongest planning-to-deployment thesis page
- `ROS project`: autonomous vacuum robot in ROS
- `Portfolio map`: crawlable overview of the full portfolio structure
- `Feedback and contact`: structured form for outreach and website feedback

## Key Features

- multi-page static portfolio architecture
- recruiter-focused homepage sections and experience mapping
- dedicated experience and project detail pages
- bilingual support for English and German
- feedback and contact form flow
- reviews and rating section
- SEO setup with:
  - `robots.txt`
  - `sitemap.xml`
  - canonical URLs
  - Open Graph and Twitter meta tags
  - JSON-LD structured data
- Google Analytics 4 and Microsoft Clarity integration
- organized asset and document structure under `site/assets/`

## Tech Stack

- HTML
- CSS
- JavaScript
- GitHub Pages
- Google Analytics 4
- Microsoft Clarity
- Google Search Console support

## Repository Structure

```text
.
├── README.md
├── scripts/
└── site/
    ├── index.html
    ├── journey.html
    ├── feedback.html
    ├── feedback-thank-you.html
    ├── portfolio-map.html
    ├── experience-*.html
    ├── project-*.html
    ├── app.js
    ├── style.css
    ├── sitemap.xml
    ├── robots.txt
    ├── assets/
    │   ├── images/
    │   └── documents/
    └── README.md
```

## Deployment

The deployable website lives inside `site/`.

Typical deployment flow:

1. Sync the contents of `site/` into the GitHub Pages repository root.
2. Commit and push to `main`.
3. Let GitHub Pages redeploy the site.

Example:

```bash
rsync -av --exclude='.DS_Store' "/path/to/sooraj-portfolio-cleaned/site/" /path/to/deployment-repo/
```

## SEO and Discovery

The site already includes:

- sitemap and crawler directives
- structured metadata and canonical URLs
- internal linking for thesis, projects, journey, reviews, contact, and portfolio map
- search-oriented homepage sections such as topic links and common portfolio questions

For Google discovery and indexing:

1. keep the site deployed on the public GitHub Pages URL
2. use Google Search Console
3. submit `sitemap.xml`
4. request indexing for the most important pages after major updates

## Analytics

Site-wide analytics and behavior tracking are configured through `site/app.js`.

Integrated services:

- Google Analytics 4
- Microsoft Clarity

These support:

- traffic measurement
- page-level engagement
- click and interaction tracking
- session recordings and heatmaps

## Contact

For professional contact, portfolio review, or collaboration:

- Email: `soorajsudhakaran1199@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/sooraj-sudhakaran1999`
- GitHub: `https://github.com/SoorajSudhakaran1199`
- Feedback and contact form: `https://soorajsudhakaran1199.github.io/sooraj-portfolio/feedback.html`

## Maintenance Notes

- Keep public page URLs stable to preserve indexing value.
- Prefer adding new images under `site/assets/images/`.
- Prefer adding certificates and documents under `site/assets/documents/`.
- Keep English and German copy aligned when editing user-facing text.
- Treat `site/` as the deployable web layer and this repository as the cleaned working source.

## Site Folder Reference

For the site-level structure and asset notes, see [site/README.md](site/README.md).
