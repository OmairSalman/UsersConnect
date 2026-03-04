# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 04-03-2026

### Security
- Updated npm dependencies to resolve 6 vulnerabilities (2 critical, 2 high, 1 moderate, 1 low)
- All packages updated to latest secure versions via `npm audit fix`

## [1.0.1] - 04-03-2026

### Fixed
- **Critical: YAML configuration not applied** - Fixed hardcoded `process.env` calls throughout codebase that bypassed the centralized configuration system
- **S3Service** - Now properly uses `config.s3.*` instead of `process.env.S3_*`
- **EmailService** - Now properly uses `config.smtp.*` instead of `process.env.SMTP_*`
- **Logger** - Now properly uses `config.logging.level` instead of `process.env.LOG_LEVEL`
- **s3Config utility** - Now checks `config.s3` instead of `process.env` for feature detection

**Impact:** YAML-based configuration (`config.yaml`) now works correctly. Previously, even though config.yaml was loaded, services bypassed it by reading environment variables directly, causing YAML settings to be ignored.

## [1.0.0] - 04-03-2026

### Added
- **Like/Dislike System** - Separate dislike button and counter for posts and comments, mutually exclusive with likes
- **Email Verification System** - Optional verification with 6-digit codes, blocks interactions until verified
- **Password Reset via Email** - Secure password recovery flow with email verification codes
- **Email Change Verification** - 3-step process: verify current email, verify new email, update
- **Custom Profile Pictures** - Upload custom avatars via S3 (appears only when S3 is configured)
- **YAML Configuration System** - `config.yaml` file with environment variable overrides, type-safe with startup validation
- **Optional SMTP** - Email features gracefully disabled when SMTP not configured, users can interact immediately
- **CORS Configuration** - Support for multiple origins, configurable methods and headers, enable/disable per deployment
- **TypeORM Migrations** - Auto-sync in development, migrations required in production, automatic on startup
- **First-Time Setup Wizard** - Guided setup at `/setup` for creating admin and configuring S3/SMTP/CORS
- **Email Privacy Toggle** - Users can show/hide email on profile (requires verification)
- **Verification Badges** - Visual indicators for verified email addresses
- **Environment Type Safety** - Complete type definitions for environment variables in `environment.d.ts`
- **Comprehensive `.env.example`** - All configuration options documented with examples
- **Winston Logging** - Configurable log levels with file rotation

### Changed
- **Profile Edit Page** - Separated into independent sections: profile picture (if S3), name, email, password, privacy
- **Profile Edit Sections** - Each section has its own save button for independent updates
- **Password Change** - Now requires current password + new password + confirmation
- **Admin User Edit** - Separated into independent sections with individual save buttons
- **Admin Password Change** - Single password field, no confirmation required for admin-initiated changes
- **Email Verification on Edit** - Admin changing user email resets verification status
- **Pagination Edge Cases** - Better handling and messages for out-of-bounds and empty states
- **Feed Out of Bounds** - Shows "You've gone too far!" message, hides previous button
- **Own Profile No Posts** - Shows "You didn't make any posts yet" with link to create
- **Own Profile Out of Bounds** - Shows "You've gone too far!" with link to post more
- **Other Profile No Posts** - Shows "[Name] has no posts yet"
- **Other Profile Out of Bounds** - Shows "You've gone too far!" with link to first page
- **Post Image Display** - Fixed centering issues on mobile devices
- **Docker Port** - Internal port hardcoded to 3000 to match `EXPOSE` directive

### Fixed
- **Redis Cache Invalidation** - Fixed double-prefixing bug where `keys()` returns prefixed keys but `del()` expects unprefixed
- **Post Image Centering** - Removed padding conflicts causing mobile display issues
- **Startup Validation** - Clear error messages for missing required configuration

### Security
- **Email Verification Security** - Session tokens for email change, duplicate prevention
- **Password Verification** - Current password required for all password changes
- **Email Change Security** - Verify both old and new email addresses

## [1.0.0-rc.2] - 19-12-2025

### Changed
- Increased file size limit for image uploads to 10 MB (from 5 MB)

## [1.0.0-rc.1] - 18-12-2025

### Added
- Optional S3 image uploads (AWS, MinIO, DigitalOcean, Cloudflare R2)
- Production-ready deployment with Gravatar profiles

### Fixed
- Navigation hyperlinks
- Post/comment edit mode

[1.0.0]: https://github.com/OmairSalman/UsersConnect/compare/v1.0.0-rc.2...v1.0.0
[1.0.0-rc.2]: https://github.com/OmairSalman/UsersConnect/compare/v1.0.0-rc.1...v1.0.0-rc.2
[1.0.0-rc.1]: https://github.com/OmairSalman/UsersConnect/releases/tag/v1.0.0-rc.1