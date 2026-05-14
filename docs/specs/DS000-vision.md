---
id: DS000
title: LydiaRX Static Site Vision
status: active
owner: repository
summary: Defines the LydiaRX public-site scope, positioning, and the decision to deliver the branded site and project documentation from the shared docs/ tree.
---

# DS000 LydiaRX Static Site Vision

## Introduction

This specification defines the scope and intent of the LydiaRX AG repository as a fully static project. The repository exists to publish a polished public site for LydiaRX AG together with the technical project pages and specifications that describe how the site is organized and maintained.

## Core Content

The project must present LydiaRX AG as a Swiss research-led venture studio working across genomic AI, regulated agentic AI, secure biomedical data collaboration, and automated R&D. The public-facing narrative must remain grounded in research-grade, venture-building, and infrastructure-oriented positioning rather than generic startup language.

The site must remain fully static. It must not depend on a backend, database, CMS, authentication layer, runtime framework, or remote font dependency. Shared HTML, CSS, JavaScript, and Mermaid diagrams are sufficient for the intended delivery model.

The `docs/` tree is the publication root for the project output. It contains the public pages, the technical project pages, the specification set, the shared style and partial assets, and the specs loader used to browse the DS files. This shared location keeps the branded site directly viewable while preserving a coherent documentation surface for the project itself.

## Decisions & Questions

### Question #1: Why does the branded site live directly under `docs/` instead of a nested site subdirectory?

Response: The project uses `docs/` as the single deployment root so the LydiaRX homepage can remain the root page of the generated output. A nested public-site folder would have pushed the branded landing page away from the primary deployment entry point and weakened the professional presentation of the result.

### Question #2: Why is the project limited to a static delivery model in the first version?

Response: The supplied blueprint explicitly favors a static implementation with one shared stylesheet and only minimal JavaScript. This constraint keeps the repository portable, easy to host, easy to inspect, and aligned with the current scope, which is presentation and documentation rather than application logic.

## Conclusion

The LydiaRX repository is a static, documentation-backed delivery for a research-led venture studio. All future work must preserve the static-first scope, the public positioning, and the shared `docs/` publication model defined here.
