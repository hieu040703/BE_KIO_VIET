# Auth Module Notes

- Protected routes should run `jwtMiddleware` before `authMiddleware` through the exported `authenticate` middleware array.
- `jwtMiddleware` only verifies JWT cookies and refreshes the access token from a valid refresh token when needed.
- `authMiddleware` checks that the request refresh token still exists in the `tokens` table, with a short Redis cache keyed by a SHA-256 hash of the refresh token.
- Any flow that issues a refresh token cookie must persist that refresh token in `tokens`; otherwise the next protected request will force the user to login again.
- A successful password change must revoke every refresh token row for that user and clear matching Redis cache entries, forcing all sessions to login again.
- Login sessions are separated by `clientType` (`web`/`mobile`), with `x-platform` as the compatibility fallback; a new login replaces only the refresh session on the same platform.
- Existing refresh-token rows are backfilled as `web` by the session-type migration; newly issued rows must persist their platform in `tokens.sessionType`.
- Web login is limited to `ADMIN` and `MANAGER` and returns HTTP 403 for other roles. Admin routes apply `authenticate` and `adminMiddleware` globally, while the public SePay webhook remains outside that guard.
