---
id: DS001
title: Coding Style And Source Layout
status: active
owner: repository
summary: Defines the coding style, source layout, content-writing boundaries, file-size guidance, and verification conventions for the LydiaRX static site project.
---

# DS001 Coding Style And Source Layout

## Introduction

This specification is the coding-style authority for the LydiaRX static site repository. It defines how HTML, CSS, JavaScript, assets, and project documentation must be organized and maintained.

## Core Content

HTML must remain semantic, readable, and page-oriented. Each public route is represented by a dedicated `.html` file under `docs/`, while shared page chrome lives under `docs/partials/`. Pages must load shared fragments through `docs/partials-loader.js` rather than duplicating navigation and footer markup across the repository.

CSS must remain centralized in `docs/styles.css`. The stylesheet is the single source of truth for tokens, layout primitives, typography, spacing, responsive behavior, tables, callouts, card layouts, navigation styling, and brand-derived color variables. Brand colors and derived surfaces must be expressed through reusable custom properties so future rebranding or logo refinements can be handled through centralized token updates rather than scattered overrides.

JavaScript must remain minimal and behavior-focused. The repository may use small scripts for partial loading, grouped navigation behavior, mobile accordion logic, and other strictly presentational client-side helpers. It must not introduce framework runtimes, state-management layers, or client-side application shells.

All generated HTML pages must include the Mermaid ESM module in `<head>`. Public diagrams may use static SVG assets under `docs/assets/` when stronger color control, higher fidelity, or better brand alignment is required. Neutral gray default diagrams are not acceptable on the public-facing pages; diagrams must be explicitly themed or replaced with colored SVG assets.

Page heroes must preserve a clear information hierarchy. On public pages, the short page, product, or company name must be the `h1`, while the longer descriptive statement must appear as a more modest subtitle below it. Authors must not force artificial line breaks or narrow width constraints on brand labels, titles, or subtitles when the surrounding layout still has horizontal space available.

Vertical rhythm near the top of each page must stay compact and purposeful. Breadcrumbs, eyebrow text, hero titles, and introductory copy should appear without large empty gaps that delay access to the first substantive content. Longer introductory and explanatory paragraphs may use justified alignment on wide layouts when that improves reading rhythm, but narrow cards and mobile layouts should remain left-aligned to avoid awkward spacing.

The repository may expose non-default visual-review modes through lightweight URL parameters and client-side persistence when those modes do not alter the information architecture or page content. The current review workflow keeps the shared theme picker coordinated through shared bootstrap logic and shared CSS rather than page-specific forks, with a default-visible Dev Preview control that can still be suppressed through stored state when needed. Alternate modes must leave the default delivery unchanged when inactive and must avoid framework dependencies.

When the site persists theme, preview, or other presentation preferences in the browser, the shared client-side layer must present truthful consent or acknowledgement copy about that storage behavior. The message must describe the repository's actual use of browser storage and must not claim analytics, tracking, or third-party cookies unless those behaviors really exist in the static site.

Content must stay factual, restrained, and evidence-compatible. The project must not invent undisclosed people, partnerships, regulatory claims, product capabilities, or deployment guarantees. When public data is unavailable, the page should use category-based wording or explicitly state that named disclosures are pending.

Site pages should prefer cards, concise lists, split layouts, and short prose blocks over tables. Outside the specification loader and specification content itself, tables are discouraged and should only appear if the information would become less clear without a true grid. Placeholder-style headers such as "text", "content", or similarly generic wording are prohibited.

The repository layout must remain stable:

- `docs/*.html` for public pages and technical project pages.
- `docs/partials/` for shared header and footer fragments.
- `docs/assets/` for SVGs and other static assets.
- `docs/specs/` for DS files and the generated specification matrix.

File-size guidance must remain explicit. Authors should keep ordinary HTML, CSS, and Markdown files below roughly 500 lines where practical and should treat 800 lines as a hard warning threshold. Lines above 120 characters should be avoided, and lines above 300 characters should be treated as defects unless a URL or Mermaid definition makes that unavoidable. The repository-level `./fileSizesCheck.sh` report is the standard inspection tool for these limits.

Verification must remain lightweight and reproducible. The repository relies on matrix generation, link verification, and static-site verification rather than on an application build step or browser test harness.

## Decisions & Questions

### Question #1: Why does the project avoid a frontend framework?

Response: The repository only needs static publishing, reusable chrome, responsive layout behavior, and a small amount of client-side enhancement. Framework tooling would add maintenance and delivery overhead without supporting a real requirement in the current scope.

### Question #2: Why is there no `DS002-llm-model-strategy.md` in this project?

Response: This repository does not implement LLM routing, model tiers, or runtime model selection logic. It documents LydiaRX AI Studio as part of the company narrative, but the site itself is a static publication project, so an LLM model-strategy specification is out of scope at this stage.

## Conclusion

Future contributors must treat this file as the canonical source for layout, coding style, content-writing boundaries, and verification discipline. New files and edits must follow these conventions before they extend the repository.
