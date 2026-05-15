---
id: DS003
title: Visual Design System
status: active
owner: repository
summary: Defines the visual language, layout behavior, typography, diagram policy, and reusable UI patterns for the LydiaRX static site.
---

# DS003 Visual Design System

## Introduction

This specification defines the visual and interaction language for the LydiaRX HTML site. It translates the supplied design intent into repository-level rules that future edits must preserve.

## Core Content

The site must present a restrained institutional aesthetic rooted in Swiss, biomedical, and technical design cues. The default LydiaRX presentation should feel serious and research-led rather than animated, playful, or startup-marketing oriented, while still carrying enough energy and clarity to avoid a flat or generic corporate presentation. Opt-in review themes may introduce tightly controlled motion only when it remains subordinate to the content and does not reduce legibility.

The design system must derive its primary palette from the LydiaRX logo and the live LydiaRX brand site. The canonical anchors are the institutional LydiaRX blue, restrained green support accents, pale blue-white surfaces defined as reusable CSS variables in `docs/styles.css`, and a darker near-black reserved for supporting headings and dense reading contexts. Large display titles and other deliberately prominent title treatments should use the LydiaRX brand blue rather than neutral black so the visual hierarchy stays recognisably tied to the logo across the public site. Public pages should use bright, luminous surfaces and subtle brand tinting rather than heavy dark backgrounds, and those colors must remain visibly repeated across navigation, buttons, dropdown menus, cards, highlights, diagrams, consent surfaces, and major title treatments.

Reusable page patterns include a hero section, single-column intro panels, embedded diagram cards, six-card spotlight grids, metric panels, concise reference lists, and clear CTA bands. The main public business pages should converge on one central spotlight pattern: exactly six icon-led cards that open concise modal-style detail panels, with diagrams embedded directly inside the one-column intro flow rather than parked in a detached second column. The Research hub is the explicit exception: its six icon-led cards should link directly to article pages instead of opening modals.

CRAP principles are mandatory across the site. Contrast must remain strong enough that text never appears visually lost against its surface. Repetition must be maintained through shared spacing, accent behavior, border radii, and card language. Alignment must remain disciplined across headers, grids, body copy, and diagram framing. Proximity must ensure that related labels, actions, and descriptions read as single units rather than as disconnected fragments. Decorative textures, violent gradients, and visually conflicting surface treatments are prohibited because they weaken repetition and contrast.

Alignment discipline also applies to text blocks and above-the-fold spacing. Long-form paragraphs in wide reading columns should align cleanly and may use justified text when that produces a calmer reading edge, but narrow card content should avoid forced justification. Breadcrumbs and hero sections must not introduce oversized vertical gaps that make the reader scroll before reaching the main title and opening explanation. Breadcrumbs belong inside the hero or page-hero floor rather than as an extra standalone band between the header and the first content floor.

Mermaid remains available for maintainable documentation diagrams, but public-facing diagrams should favor themed SVG assets whenever they provide stronger visual quality or better brand fidelity. Gray default diagrams are prohibited on the public site; diagrams must use the same restrained blue-green brand language as the surrounding UI and must keep text short enough to remain well-contained inside their visual shapes. SVG diagrams must feel integrated with the page rather than rendered as separate dark boxes: transparent backgrounds, restrained halos, disciplined alignment, and a small number of short labels are mandatory.

Responsive behavior must collapse comfortably on tablet and mobile. Navigation must switch to a controlled mobile menu before links become cramped, and content grids must reduce to single-column layouts without obscuring key information. The header itself should remain prominent and refined, but it must still resolve to a single-row desktop bar rather than stacking multiple navigation rows.

Desktop navigation emphasis must remain restrained. Active or open menu states should rely primarily on text-color emphasis and a subtle secondary cue such as an underline or fine rule, rather than on loud filled pills or heavy background chips that dominate the header chrome. Dropdown menus must remain visually above page content and must never be clipped by the decorative header shell.

The default LydiaRX visual system remains the authoritative presentation. However, the site may also expose explicitly opt-in review themes for design exploration when those variants preserve the same content structure and page hierarchy. The current review themes are `fusion` and `inspiration`, and the shared corner review widget should be visible by default unless a stored override explicitly disables it. Alternate themes must remain visibly coherent across public pages, technical pages, navigation, consent UI, dialogs, and diagrams rather than only recoloring isolated components. The `inspiration` review theme should use one shared low-contrast animated helix-style point-field system on its selected white tower floors, with randomised seeds per page, floor, and refresh so the layouts regenerate uniquely on each run. That motion should read like a dense gas chamber from which many elongated genomic clusters emerge from outside the visible band, drift, collide subtly, and dissolve back into the wider field while a faster ambient swarm continues moving between them. The motion layer must always remain behind fully opaque content, above a white base surface, and below a left-to-right white reading mask that keeps the text edge calm.

## Decisions & Questions

### Question #1: Why does the first version avoid animation and decorative media?

Response: The design direction prioritizes technical clarity, institutional credibility, and content-first reading. Visual depth should therefore come from palette, contrast, layout, and surface treatment before any decorative motion is considered. When motion is used at all, it must stay narrow in scope, remain behind the reading layer, and belong to explicitly opt-in review presentations rather than becoming a default-site styling habit.

### Question #2: Why are system fonts required instead of hosted brand fonts?

Response: System fonts preserve portability, loading performance, and static-hosting simplicity. They also align with the brief, which prioritizes maintainability and avoids unnecessary third-party runtime dependencies.

## Conclusion

The LydiaRX visual system is minimal, structured, and evidence-oriented. Future changes must preserve the restrained palette, strong typographic hierarchy, and maintainable diagram approach defined here.
