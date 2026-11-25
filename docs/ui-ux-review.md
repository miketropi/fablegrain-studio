# Studio UI/UX pass (0.5.0)

Source-based audit: the direct public fetch was unavailable at authoring time; do not claim the live UI has been visually reviewed. The GitHub Actions workflow now includes Chromium tests against both the new production build and the user-provided deployment. Deployed smoke tests create browser-local test records only, no provider calls or backend mutations.

Changes: compact project dashboard and search, story-first onboarding for new projects, format-aware FPS, library search and asset thumbnails, responsive accessible panel toggles, clear local save status and JSON backup affordance, timeline resizing with UI SDK bindDrag and keyboard support, explicit opacity keyframe commit, compatible track options, restrained neutral tokens. Existing project schema and localStorage key remain unchanged.

Limitations: visual review still requires actual screenshots; browser checks are smoke tests, not comprehensive UX validation. No deployment configuration was changed. Browser-local asset capacity and media/provider constraints remain.
