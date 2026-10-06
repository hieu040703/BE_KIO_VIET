# Auth module

- `yarn db:seed:admin` creates or updates the default tenant and one active admin user.
- Login is available at `POST /v1/auth/login` with `email` and `password`.
- The response contains a JWT bearer token and the tenant ID needed by retail resources.
- `GET /v1/auth/me` validates the bearer token and returns the active user.
- Override the seed defaults with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_TENANT_CODE`, and `ADMIN_TENANT_NAME`.
