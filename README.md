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
