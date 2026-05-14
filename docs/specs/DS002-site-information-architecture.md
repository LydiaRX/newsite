---
id: DS002
title: Site Information Architecture
status: active
owner: repository
summary: Defines the page inventory, navigation model, technical page placement, and content responsibilities for the LydiaRX static site.
---

# DS002 Site Information Architecture

## Introduction

This specification defines the structure of the LydiaRX HTML output. It governs which pages exist, how readers move between them, and how public-facing content coexists with technical repository pages.

## Core Content

The site must use a header-based primary navigation model shared across the HTML set. The public header must stay limited to a small number of top-level actions so it remains on one line at desktop widths and collapses cleanly on mobile. The homepage is reached through the LydiaRX brand mark, while secondary public routes are grouped into compact dropdown or accordion collections instead of appearing as an overloaded flat link list.

The homepage must serve as both the LydiaRX landing page and the primary documentation entry point for the generated output. It must remain a polished public page first, while still exposing stable links to the project architecture page, the repository governance page, and the DS specification matrix.

The site must include the following public pages:

- `index.html`
- `venture-studio.html`
- `lydiarx-ai-studio.html`
- `genomic-ai.html`
- `omics-firewall.html`
- `pharma-rd-workbenches.html`
- `portfolio.html`
- `research.html`
- `team.html`
- `contact.html`

The site must also include technical project pages that explain the repository structure, delivery model, and governance:

- `project-architecture.html`
- `repository-governance.html`

Every non-home page must include a breadcrumb path back to `index.html`. Technical pages must explicitly link to `specsLoader.html?spec=matrix.md` and to `specsLoader.html?spec=DS001-coding-style.md`.

Public-facing business pages must not expose repository-internal implementation notes, specification summaries, bootstrap catalogs, or maintenance-oriented navigation blocks inside their body content. Those materials belong only on dedicated technical project pages.

## Decisions & Questions

### Question #1: Why are technical project pages included in the same HTML set as the public pages?

Response: The bootstrap rules require stable access to repository architecture, coding-style authority, and the specification set from the generated HTML output. Housing those project pages inside the same `docs/` tree preserves one deployable output while keeping the downstream-project documentation separate from imported skill-local guidance.

### Question #2: Why are the technical pages linked as supporting resources instead of becoming primary navigation items?

Response: The primary navigation belongs to the public LydiaRX story. Technical project pages still need stable access, but presenting them as supporting resources preserves the professionalism of the public site while keeping repository guidance reachable.

## Conclusion

The LydiaRX site uses one coherent HTML set that combines public pages with a limited number of host-project documentation pages. Future work must preserve this structure unless the DS set is updated first.
