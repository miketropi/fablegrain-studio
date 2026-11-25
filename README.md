# Fablegrain Studio

**Build worlds. Craft stories. Bring them to life.**

An AI-native visual storytelling workspace for comics, motion comics and video.

## Quick start

Requires Node.js 22.16+ and npm.

    npm install
    npm run dev

Open http://localhost:3000. The demo project contains placeholder clips; create a new project for an empty timeline.

    npm test
    npm run typecheck
    npm run build

UI SDK is a beta dependency. Versions currently resolve at install time; commit the resulting package-lock.json once installation and build are verified. Follow the official [UI SDK setup](https://ui-sdk.dev/docs) and optionally install the official agent skill from its documentation.

## Initial foundation

- Next.js App Router, React 19, TypeScript, UI SDK React Button and Toolbar, and UI SDK Core bindDrag.
- Project creation with format, aspect ratio and FPS; browser-local project data; editable story bible, character descriptions and asset metadata.
- Workspace shell and placeholder composition preview.
- Integer-frame timeline with zoom, playhead, timecode, simulated playback, same-track clip move and trim, overlap bounds, snapping, split, delete, keyframe markers, undo/redo, and JSON export.
- Pure timeline unit tests.

This is an unverified early implementation, not a media editor release. The authoring environment could not access npm, so dependency installation, type checking, browser interaction and Next.js build are pending. No lockfile has been generated. Playback only advances the playhead; audio/video composition is not implemented. Dragging between tracks, media import, source in/out trimming, real character sheet generation, keyframe interpolation, canvas editing, image/video export, provider calls, and server persistence are not implemented.

## Next milestones

1. Verify installation and browser interaction. Evaluate createSpans and custom primitives against frame math; adopt them when they satisfy editor constraints. Add automated pointer/keyboard tests.
2. Add persistent project schema (PostgreSQL), asset storage, history and a story map.
3. Comic visual builder: pages, panels, independent lettering and image export.
4. Motion builder: media clips, source offsets, tracks, keyframes and real preview/render runtime.
5. Server-side Composio integration: session-based provider connections, job queue, budget and provenance. Add a separate inbound MCP interface with permissioned project commands.

See [architecture notes](docs/architecture.md).


## Milestone 1 — production workflow (0.2.0)

Production tab includes an ordered chapter/scene map, cast assignments, style notes, character reference sheet links, local PNG/JPEG/WebP asset import, draggable comic panels with independent dialogue, page reordering and scene references, missing-reference review, full-resolution PNG export and silent page-slideshow WebM export. Assets are limited in size because storage is browser-local. Video timeline remains independent and does not render these pages yet.

AI tab creates a server-side Composio session with a configured toolkit allowlist, instant usage disabled, and returns tool names only. Copy .env.example to .env.local and configure the owner token and Composio values. This is a single-owner integration spike, not multi-tenant authentication, and does not execute generation tools. Verify against your Composio account before enabling anything paid.

Timeline now includes compatible-track transfer and interpolation primitives (dragging between tracks and live interpolation remain pending). Unit test suite expanded for these and production model invariants. No build, browser, or provider test has passed in the authoring environment: npm and GitHub DNS access from terminal are unavailable. The previous unverified status still applies. Run all checks locally before release.

## Remaining release gates

- Resolve/pin dependency versions and lockfile; verify UI SDK interactions including createSpans and multi-select; run browser tests.
- Replace localStorage with persistent database and object storage; introduce authentication, migration, and quotas.
- Real media import, timeline composition, audio, source trimming, keyframe runtime, MP4 export and rendering job queue.
- Character generation, AI provider tool execution, job lifecycle, cost approval, retries and asset provenance; inbound MCP authorization.
- Validate image export layout versus preview, WebM compatibility and memory usage; add page/chapter management and robust history.


## Milestone 2 — comic-to-motion bridge (0.3.0)

The Editor can append comic pages as image clips and bind page/image assets and text to timeline clips. It now draws a canvas composition from active clips with linear opacity keyframes, supports adding same-kind tracks and compatible cross-track pointer moves, and offers silent browser WebM timeline export. Export refuses unresolved sources or audio clips. The browser encoder is real-time and capped at 30 FPS and 120 seconds, not deterministic offline MP4 rendering. Source video/audio import, source offsets, audio sync, transforms, and multi-selection remain pending.

Milestone 1 model/timeline tests were executed with Node 22.16: 14/14 passed, with matching Git blob hashes. The newly added composition tests and complete application build/browser/provider checks still require verification. No npm lockfile is available.

## Verification update

All 16 pure model/sequence unit tests pass under Node 22.16; the six test/source files were checked against their committed Git blob hashes. The cross-track drag draft now preserves the original DOM parent until commit to avoid losing pointer capture. This interaction has not yet been verified in a browser. The Composio route additionally rejects session responses that do not confirm the configured allowlist and disabled instant usage. Provider behavior is unverified. The full application still needs dependency installation, typecheck, build and browser QA.

## Milestone 3 — scoped outbound MCP (0.4.0)

The AI Director can send a prompt with optional story context to one owner-configured image tool using the official Composio SDK and an MCP Streamable HTTP client. Configure the exact toolkit, tool slug, prompt field, default arguments, output path and allowed CDN hosts in .env.local. Connect the provider account to the configured Composio user first. Each call requires explicit approval, server-side token authentication, an allowlisted scoped session, and duplicate protection within the running process. Instant usage is disabled; connected provider charges may still apply. No generation call is made automatically. Import a returned inline image or a permitted CDN image into the local asset library. CORS/size restrictions apply. If a provider returns a job rather than an image, record its job ID and check provider history; async polling and durable jobs are not implemented. The configured tool must be an image-generation tool; this is not a generic multi-tenant execution endpoint.

The integration follows https://docs.composio.dev/docs/sessions-via-mcp and https://ts.sdk.modelcontextprotocol.io/client. Live credentials and provider response mapping must be verified by the project owner. Do not store keys in the repository or browser.

## Getting started — example project (0.9.0)

Open **The last signal** on the project dashboard. It is an editable, self-contained 8-second motion comic with 2 characters, 2 scenes, 2 pages, 6 illustrated panels, 2 character design references and a pre-linked timeline with opacity keyframes. The built-in SVG illustrations are original sample art, not AI generation. No credentials or external requests are needed. Click Guide for direct links to Story Bible, Character sheets, Story map, Comic pages and Editor. Use PNG export in Comic pages, or silent WebM export in Editor. Older local projects are retained, and the complete sample is inserted as a new record only if absent. Existing sample edits are not overwritten.
