# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with nodemon + ts-node (auto-reloads on changes)
npm run build        # Clean, compile TypeScript, and copy views/public to dist/
npm start            # Run compiled production build from dist/
npm test             # Run Jest tests (with coverage)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate detailed coverage report

# TypeORM Migrations
npm run migration:generate -- src/migrations/Name  # Generate migration from entity changes
npm run migration:create -- src/migrations/Name    # Create empty migration template
npm run migration:run                              # Apply pending migrations manually
npm run migration:revert                           # Rollback last migration
npm run migration:show                             # View migration status
```

The dev server watches `src/` and reloads on `.ts`, `.hbs`, `.json`, `.css`, `.js` changes.

## Architecture Overview

**UsersConnect** is a server-side rendered social media platform. The stack is Express 5 + TypeScript, TypeORM (MySQL), Redis (ioredis), and Handlebars (`.hbs`) templates.

### Build & Deployment Pipeline

**Development:**
```bash
npm run dev  # ts-node runs TypeScript directly, synchronize: true auto-syncs schema
```

**Production:**
```bash
npm run build  # Compiles src/ → dist/ (including migrations/)
npm start      # Runs compiled JS from dist/, migrationsRun: true applies migrations
```

The Docker image copies `dist/` after compilation. Migration files must be generated and committed to git before building the Docker image.
```

### Request Flow

```
Browser/API Client
  → Express Middlewares (CORS, body parsing, cookie-parser)
  → Auth Middlewares (isAuthenticated, isAdmin, etc.)
  → Validation Middlewares (express-validator chains)
  → Router → Controller → Service → TypeORM Entity / Redis
  → Response (JSON for API routes, rendered .hbs for web routes)
```

### Key Architectural Decisions

**Dual-mode routing**: The app serves both SSR web pages and a REST JSON API from the same process. Web routes live under `src/routers/web/` (renders `.hbs` templates); API routes live under `src/routers/api/`. The `isAuthenticated` middleware detects whether a request is from a browser or API client via `Accept: application/json` header and responds accordingly (redirect vs. 401 JSON).

**Database sync in dev**: TypeORM `synchronize: true` is only enabled when `NODE_ENV=development`. In production, use migrations (`npm run typeorm migration:create`).

**Redis caching with `keyPrefix`**: The Redis client uses `keyPrefix: 'usersconnect:'`. When manually deleting keys (e.g., with `redisClient.del(...keys)`), strip the prefix first — the client re-adds it. Cached data includes: `feed:page:1` (10 min TTL), `user:{userId}:posts:page:*` (paginated profile posts). Cache is invalidated in services when mutations occur.

**S3 is optional and feature-gated**: `src/utils/s3Config.ts` exports `isS3Configured()`. Image upload fields are hidden in the UI and upload endpoints are no-ops when S3 env vars are absent.

**SMTP is optional and feature-gated**: `src/utils/smtpConfig.ts` exports `isSMTPConfigured()` (mirrors S3 pattern, uses `config` object). When SMTP is absent: `isEmailVerified` middleware is bypassed (all users can act freely), password reset/forgot-password routes redirect to `/`, and email-related UI (verification badge, "Verify Email"/"Change Email" buttons, "Forgot password?" link) is hidden via the `smtpEnabled` Handlebars variable. Users can register and use the platform immediately without email verification.

**CORS is disabled by default**: Only enable when a separate frontend (Angular, React, etc.) needs to access the API. When enabled, only origins listed in `config.cors.allowedOrigins` receive `Access-Control-Allow-Origin` headers. Configured via `config.yaml` or env vars (`CORS_ENABLED=true`, `CORS_ALLOWED_ORIGINS=http://localhost:4200,...`).

**JWT auth with refresh tokens**: Access tokens (15 min) and refresh tokens are stored as HTTP-only cookies. `isAuthenticated` middleware silently refreshes the access token using the refresh token when it expires.

**Password reset / email verification flow via Redis**: Temporary codes and session tokens are stored in Redis with short TTLs (password-reset: 10 min, reset-session: 5 min, email-verification: 10 min, email-change: 10 min).

### Configuration System

UsersConnect uses a centralized configuration system with three layers (lowest → highest priority):
1. **Default values** (`src/config/default.config.ts`) — minimal sensible defaults
2. **`config.yaml`** (optional, project root) — deployer-friendly, excluded from git
3. **Environment variables** — always override everything

The config is loaded once at startup via `loadConfig()` and exported as a singleton from `src/config/index.ts`. `src/config/index.ts` **must be the first import** in `src/index.ts` so it runs before other modules read configuration.

```typescript
import { config } from './config';       // type-safe access
config.app.nodeEnv                       // 'development' | 'production' | 'test'
config.redis.ttl.default                 // number (seconds)
```

**Port:** The app always listens on port 3000 (hardcoded to match `EXPOSE 3000` in the Dockerfile). Use Docker port mapping for external exposure: `docker run -p 8080:3000 usersconnect`.

**For deployers:** Copy `config.example.yaml` to `config.yaml` and customize. Use environment variables for secrets (JWT secrets, DB password, S3 keys).

**Note:** `src/services/emailService.ts` and `src/services/s3Service.ts` still read `process.env` directly — YAML configuration for those services requires additional migration.

### Database Migrations

**Development (`NODE_ENV=development`):** `synchronize: true` — TypeORM auto-syncs entity changes to the database. Migrations are not run.

**Production/test:** `synchronize: false`, `migrationsRun: true` — Migrations run automatically on startup. Schema never changes without an explicit migration.

**Migration workflow:**
1. Make entity changes
2. Generate migration: `npm run migration:generate -- src/migrations/DescriptiveName`
3. Review the generated `up()` / `down()` SQL in `src/migrations/`
4. Commit the migration file to git
5. Deploy — migrations apply automatically when the app starts

Migration files live in `src/migrations/` (TypeScript, committed to git). The build compiles them to `dist/migrations/` (JavaScript, excluded from git via `dist/` in `.gitignore`).

**Important:** Always review generated migrations before committing — TypeORM may not detect all edge cases (e.g. column renames vs drop+add). Test in staging before production.

### Source Layout

```
src/
├── config/
│   ├── dataSource.ts       # TypeORM DataSource (MySQL) — uses config object
│   ├── redis.ts            # ioredis client singleton
│   ├── logger.ts           # Winston logger
│   ├── environment.d.ts    # process.env type declarations
│   └── express.d.ts        # Express Request augmentation (req.user: UserPayload)
├── migrations/             # TypeORM migration files (committed to git)
├── entities/               # TypeORM entities (User, Post, Comment) — extend BaseEntity
├── services/               # Business logic; call entities and Redis directly
├── controllers/
│   ├── api/                # Return JSON responses
│   └── web/                # Render Handlebars templates
├── routers/
│   ├── api/                # REST API routes
│   └── web/                # SSR page routes
├── middlewares/
│   ├── auth/               # isAuthenticated, isAdmin, isPostAuthor, isCommentAuthor, isEmailVerified
│   └── validation/         # express-validator chains per resource
├── utils/
│   ├── publicTypes.ts      # PublicUser, PublicPost, PublicComment, MinimalUser types
│   ├── publicDTOs.ts       # userToPublic, postToPublic, commentToPublic, userToMinimal mappers
│   ├── s3Config.ts         # isS3Configured() check
│   └── smtpConfig.ts       # isSMTPConfigured() check
├── views/                  # Handlebars templates (.hbs)
│   ├── layouts/
│   ├── pages/
│   └── partials/
└── tests/                  # Jest test files (mirroring src structure)
```

### DTO / Type Pattern

Never expose raw TypeORM entities in responses. Always map through `publicDTOs.ts`:
- `userToPublic(user)` → `PublicUser` (includes email, isAdmin, etc.)
- `userToMinimal(user)` → `MinimalUser` (only `_id`, `name`, `avatarURL`) — used in post/comment author references
- `postToPublic(post)` → `PublicPost`
- `commentToPublic(comment)` → `PublicComment`

### Environment Variables

All configuration can be set via environment variables or `config.yaml`. Environment variables always take priority. See `.env.example` for a complete list with descriptions.

Required: `NODE_ENV`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `DATABASE_HOST`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `REDIS_HOST`

Optional (Redis): `REDIS_PASSWORD`

Optional (S3): `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_NAME`, `S3_REGION`, `S3_ENDPOINT`, `S3_PUBLIC_URL`

Optional (Email): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`

Optional (CORS): `CORS_ENABLED`, `CORS_ALLOWED_ORIGINS`, `CORS_ALLOW_CREDENTIALS`, `CORS_ALLOWED_METHODS`, `CORS_ALLOWED_HEADERS`

Optional (Other): `GRAVATAR_API_KEY`, `LOG_LEVEL`

### Coding Conventions

- 2-space indentation, single quotes, semicolons
- File names: camelCase (`postService.ts`); Classes: PascalCase; Constants: `UPPER_SNAKE_CASE`
- Avoid `any`; use `unknown` in catch blocks
- Commit format: `type(scope): subject` where type is `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`
