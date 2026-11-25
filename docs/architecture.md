# Architecture / Milestone 0

## Boundary decisions

Start as one Next.js application with isolated feature folders rather than a monorepo before reusable boundaries stabilize. UI SDK supplies the design foundation and interaction primitives; custom timeline semantics remain in src/editor/timeline.ts. Current UI uses documented bindDrag, Button and Toolbar. A createSpans spike remains a separate task, not an implemented dependency.

## Project structure

- app: Next.js entry and design tokens.
- src/studio: local project metadata and workspace.
- src/editor: pure timeline functions, tests and interaction view.

## Data model

Project -> story bible / characters / assets / sequence. A sequence has FPS, integer duration, tracks and clips. Clip ranges are half-open [start,end). Keyframes are clip-local integer frames. Current trim edits placeholder spans, not source-media offsets. New projects begin empty. The example project is synthetic.

## Production design (future)

Separate asset identity from versions and generated variants. Use chapters/scenes/shots/panels to connect comic and motion outputs; track references rather than duplicate assets. Build a shared story context resolver for character appearance, style bible, locations and continuity. Export should consume a deterministic composition, not UI state.

AI integration: server-only provider abstraction, Composio as outbound tool/auth layer; asynchronous generation jobs with idempotency, cancellation, cost estimation and output provenance. Keep API keys server-side, isolate projects and accounts. Inbound MCP exposes validated editor commands, not direct database writes. Record history and require approval before paid or destructive actions.

Rendering: evaluate Remotion and FFmpeg; separate preview from export, account for licensing. Do not implement provider or rendering workflows without validating their official APIs.

## Acceptance gate

Verify dependency versions, browser keyboard and pointer behavior, drag cancellation, snapping, project persistence, undo/redo and JSON export; then CI build. Do not label milestone zero complete until this gate passes.
