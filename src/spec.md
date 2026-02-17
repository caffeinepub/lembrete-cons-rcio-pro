# Specification

## Summary
**Goal:** Add restricted access so the app is only usable after an admin manually confirms Pix payment, including user accounts and an admin panel.

**Planned changes:**
- Implement backend email+password accounts with persisted user records, salted password hashing, and account status fields (payment status and enabled/disabled).
- Add backend APIs for register/login, fetching current account status, and client logout via local session clearing.
- Create frontend gating so unauthenticated users only see auth + paywall flow, and logged-in but unapproved/disabled users only see a paywall status screen.
- Build a paywall screen showing Pix amount/key/instructions (English text) and allowing the user to submit a transaction code and/or upload payment proof for admin review.
- Add admin-only backend APIs to list users, view payment submissions, approve payments (activate), and enable/disable users, with a defined initial-admin bootstrap mechanism.
- Add an admin panel UI (admin-only) to review users and submissions, approve payments, and toggle enabled/disabled, updating without full refresh.
- Update navigation to keep at most three main screens for activated users, integrating admin tools without adding a fourth main screen, and preventing gated users from reaching internal modules.
- Centralize Pix display values (amount/key/instructions) in a single frontend configuration module.

**User-visible outcome:** Users can register and log in but will only see a Pix paywall/status screen until an admin approves payment and enables their account; admins can review submissions and activate/disable users from an admin-only section in the app.
