# Merge report

Base: nextpro; Dashboard source: https://github.com/sungjinwoozz/adminui

Routes: /, /login, /shop (original) and /admin (adminui)
Admin UI files are copied, not recreated.
Admin import files rewritten: 6
Root layouts are isolated with (site) and (admin) route groups.

Asset conflicts retained from nextpro:
- None

IMPORTANT: Dashboard originally includes placeholder/demo data.
IMPORTANT: /admin is not authentication-protected by this merge.
Implement server-side session + role checks before deploying publicly.
IMPORTANT: npm install timed out in the build environment, so build and CSS are NOT verified.
IMPORTANT: verify build and CSS appearance locally.
Run: npm install && npm run build && npm run dev
