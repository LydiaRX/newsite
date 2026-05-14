---
id: DS004
title: Documentation And Delivery Model
status: active
owner: repository
summary: Defines how the site, DS specifications, shared partials, and verification workflow fit together inside the shared docs/ delivery root.
---

# DS004 Documentation And Delivery Model

## Introduction

This specification defines the relationship between the public HTML site, the repository documentation surfaces, and the verification workflow used to keep them synchronized.

## Core Content

The `docs/` directory is the shared publication root for the project. It must contain the public LydiaRX pages, the technical project pages, the shared stylesheet, the shared partials, the specification set, and the specs loader. This arrangement is intentional and must be treated as part of the repository contract.

`AGENTS.md` and the DS files define repository obligations; the HTML technical pages translate those obligations into a browsable project narrative. If wording diverges, the DS files remain authoritative and the HTML pages must be updated to match them. Public business pages must remain free of repository-maintenance artefacts even though the technical pages are published from the same root.

`docs/specs/matrix.md` must be generated from DS frontmatter rather than edited manually. The canonical specs loader must be copied into `docs/specsLoader.html` whenever the documentation set is rebuilt.

Relative linking must remain compatible with the repository verification scripts. Root-level HTML pages should reference shared assets through root-relative or same-directory paths that resolve from `docs/`, and any future nested HTML locations must use relative paths that the verifier can resolve correctly from the nested directory.

The repository verification workflow consists of the matrix generator, documentation-link verifier, static-site verifier, and the file-size report. These checks are lightweight but mandatory after meaningful documentation or layout changes.

## Decisions & Questions

### Question #1: Why are partials and shared JavaScript part of the delivery model?

Response: Shared header and footer fragments keep navigation and project-resource links synchronized across the site without introducing a framework or build step. The loader script is therefore part of the static delivery contract, not an incidental convenience.

### Question #2: Why do the public site and the technical documentation share the same `docs/` delivery root?

Response: The shared delivery root keeps the LydiaRX homepage deployable from the same generated output that exposes the architecture and specification pages. This approach avoids a second publishing tree while preserving stable links to the project documentation.

## Conclusion

The LydiaRX repository delivers one static HTML output that combines the branded site and the host-project governance surface. Future edits must preserve the shared `docs/` contract and the verification workflow that protects it.
