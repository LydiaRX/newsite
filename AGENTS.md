# AGENTS.md

## Scope

This repository is a downstream static-site project for LydiaRX AG. It consumes imported agent skills from `.agents/skills/`, but the host project itself is the source of truth for the public HTML site, the repository documentation pages under `docs/`, and the DS specification set under `docs/specs/`.

## Mandatory Reading Order

1. Read `docs/specs/DS001-coding-style.md` for coding style, source layout, naming, documentation structure, and verification expectations.
2. Read `docs/specs/DS000-vision.md` for project scope, public positioning, and repository-level constraints.
3. Read `docs/project-architecture.html` and `docs/repository-governance.html` before making documentation, layout, navigation, or delivery changes.
4. Read the affected DS files under `docs/specs/` before changing behavior, structure, content policy, or documentation surfaces.

## Current Skill Catalog

The imported local skills currently available in this repository are:

| Skill | Path | Purpose |
| --- | --- | --- |
| `achilles_specs` | `.agents/skills/achilles_specs/` | Adds Achilles-oriented runtime and coding-style rules for projects that use AchillesAgentLib. |
| `antropic_skill_build` | `.agents/skills/antropic_skill_build/` | Defines the portable Anthropic-style baseline for self-contained skills. |
| `article_build` | `.agents/skills/article_build/` | Rebuilds article outputs from article-owned plans, assets, and references. |
| `cskill_build` | `.agents/skills/cskill_build/` | Defines specification-driven conventions for C-Skills that generate executable JavaScript. |
| `dgskill_build` | `.agents/skills/dgskill_build/` | Defines guarded dynamic code-generation skill conventions. |
| `gamp_specs` | `.agents/skills/gamp_specs/` | Bootstraps AGENTS guidance, DS specifications, HTML documentation, and synchronization rules. |
| `oskill_build` | `.agents/skills/oskill_build/` | Defines orchestration-skill conventions for planner-style skills. |
| `review_specs` | `.agents/skills/review_specs/` | Reviews and reconciles affected DS files with current implementation and context. |

`AGENTS.md`, `docs/index.html`, and `docs/specs/matrix.md` must mention the same current skill set whenever this catalog changes.

## Repository Rules

- The DS specifications under `docs/specs/` are the authoritative source of truth for documented behavior, structure, constraints, and rationale.
- When source code or content changes affect behavior, interfaces, architecture, workflows, styling rules, or repository constraints, both the HTML documentation and the affected DS specifications must be updated in the same change set.
- All documentation, specifications, and code comments must be written in English.
- `DS001-coding-style.md` is the coding-style authority for HTML, CSS, JavaScript, content structure, file layout, and verification conventions.
- DS numbering must remain gap-free. `DS000-vision.md` and `DS001-coding-style.md` are mandatory and the next DS file must always continue the contiguous sequence.
- Every ordinary DS file must use the `Introduction`, `Core Content`, `Decisions & Questions`, and `Conclusion` structure.
- `Decisions & Questions` must use numbered subchapters in the form `### Question #n: ...`. Resolved items use `Response:` and unresolved alternatives use `Options:`.
- This host project must not place imported-skill DS files or standalone imported-skill pages inside the host project's `docs/` or `docs/specs/` trees. Imported skill guidance stays inside `.agents/skills/`.
- Future agents must update `AGENTS.md` whenever skill folders are added or removed under `.agents/skills/`.
- When repository bootstrap policy, coding-style rules, or documentation-structure rules change, update `.agents/skills/gamp_specs/` as well as this host project.

## Runtime Defaults

- The site is a fully static HTML delivery with no backend, database, CMS, authentication, or framework runtime.
- Shared presentation lives in `docs/styles.css`; shared chrome lives in `docs/partials/`; `docs/partials-loader.js` loads those fragments and initializes the mobile navigation.
- All generated HTML pages include the Mermaid ESM module in `<head>` so inline Mermaid diagrams remain available across the documentation set.
- Public pages and technical project pages share the same `docs/` delivery root so the branded site can stay deployable from the repository output.
- Verification uses the GAMP helper scripts and the repository `fileSizesCheck.sh` report.

## Key Paths

- `docs/index.html` — LydiaRX homepage and primary documentation entry point.
- `docs/project-architecture.html` — host-project architecture, imported skill catalog, and site structure notes.
- `docs/repository-governance.html` — documentation governance, delivery model, and update obligations.
- `docs/specs/` — authoritative DS specification set.
- `docs/specsLoader.html` — specification loader for `matrix.md` and individual DS files.
- `docs/styles.css` — shared stylesheet for public and technical pages.
- `docs/partials/` — shared header and footer fragments.
- `docs/assets/` — static assets such as SVGs.
- `.agents/skills/` — imported local skill catalog.
- `fileSizesCheck.sh` — repository-wide file-size and long-line reporting helper.
