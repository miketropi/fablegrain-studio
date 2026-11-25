# Fablegrain Studio — agent instructions

- UI SDK first: follow the official ui-sdk skill if installed; before editing UI read node_modules/@ui-sdk/react/docs/llms.txt. For custom components search core.md and read rendering.md in that directory.
- Prefer documented UI SDK behaviors and composed React parts; do not introduce another interaction library without a documented reason. Keep CSS neutral, compact, keyboard-accessible and token-based.
- The editor model is the source of truth. Use integer frames; keep timeline edits pure and separate from pointer input and playback. One drag commits once; Escape cancels. Test frame bounds, overlaps, and keyframe remapping.
- Preserve project data; no provider keys or secrets in browser or repository. Composio outbound tools and inbound project MCP must be server-side, scoped and auditable.
- Never claim media generation, rendering or production readiness until tested. Placeholder data and media must be labeled.
- Before a merge run npm test, npm run typecheck and npm run build; add a lockfile after resolving real UI SDK versions. Do not bypass release-age policies.
