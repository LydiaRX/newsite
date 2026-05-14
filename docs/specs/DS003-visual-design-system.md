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

The site must present a restrained institutional aesthetic rooted in Swiss, biomedical, and technical design cues. The visual system should feel serious and research-led rather than animated, playful, or startup-marketing oriented, while still carrying enough energy and clarity to avoid a flat or generic corporate presentation.

The design system must derive its primary palette from the LydiaRX logo. The logo blue and logo green are the canonical anchors for the theme, with additional support tones defined as reusable CSS variables in `docs/styles.css`. Public pages should use bright, luminous surfaces and subtle brand tinting rather than heavy dark backgrounds. The logo colors must remain visibly repeated across navigation, buttons, cards, highlights, and diagrams.

Reusable page patterns include a hero section, card grids, split-content sections, diagram panels, metric panels, concise reference lists, and clear CTA bands. These patterns must remain consistent across public pages and technical project pages.

CRAP principles are mandatory across the site. Contrast must remain strong enough that text never appears visually lost against its surface. Repetition must be maintained through shared spacing, accent behavior, border radii, and card language. Alignment must remain disciplined across headers, grids, body copy, and diagram framing. Proximity must ensure that related labels, actions, and descriptions read as single units rather than as disconnected fragments. Decorative textures, violent gradients, and visually conflicting surface treatments are prohibited because they weaken repetition and contrast.

Mermaid remains available for maintainable documentation diagrams, but public-facing diagrams should favor themed SVG assets whenever they provide stronger visual quality or better brand fidelity. Gray default diagrams are prohibited on the public site; diagrams must use the same restrained blue-green brand language as the surrounding UI and must keep text short enough to remain well-contained inside their visual shapes. SVG diagrams must feel integrated with the page rather than rendered as separate dark boxes: transparent backgrounds, restrained halos, disciplined alignment, and a small number of short labels are mandatory.

Responsive behavior must collapse comfortably on tablet and mobile. Navigation must switch to a controlled mobile menu before links become cramped, and content grids must reduce to single-column layouts without obscuring key information. The header itself should remain prominent and refined, but it must still resolve to a single-row desktop bar rather than stacking multiple navigation rows.

## Decisions & Questions

### Question #1: Why does the first version avoid animation and decorative media?

Response: The design direction prioritizes technical clarity, institutional credibility, and content-first reading. Visual depth should therefore come from palette, contrast, layout, and surface treatment before any decorative motion is considered.

### Question #2: Why are system fonts required instead of hosted brand fonts?

Response: System fonts preserve portability, loading performance, and static-hosting simplicity. They also align with the brief, which prioritizes maintainability and avoids unnecessary third-party runtime dependencies.

## Conclusion

The LydiaRX visual system is minimal, structured, and evidence-oriented. Future changes must preserve the restrained palette, strong typographic hierarchy, and maintainable diagram approach defined here.
