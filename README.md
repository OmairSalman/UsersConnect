# UsersConnect 🌐

A modern full-stack social media platform built with Node.js, Express, and TypeScript. Create posts with optional images, comment, like, and connect with users in a responsive interface.

Built during field training at [AsalTech](https://asaltech.com/) under professional mentorship.

**Live Demo:** [https://usersconnect.cloudomair.org/](https://usersconnect.cloudomair.org/)  
**Docker Hub:** [omairsalman/usersconnect](https://hub.docker.com/r/omairsalman/usersconnect)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Docker Pulls](https://img.shields.io/docker/pulls/omairsalman/usersconnect)](https://hub.docker.com/r/omairsalman/usersconnect)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [S3 Image Uploads (Optional)](#️-s3-image-uploads-optional)
- [Docker Deployment](#-docker-deployment)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [AWS S3 Setup Tutorial](#️-aws-s3-setup-tutorial)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based auth with access/refresh token pattern
- 📝 **Post Management** - Create, edit, and delete posts with rich text content
- 💬 **Interactive Comments** - Nested comment system with real-time updates
- 👍 **Social Engagement** - Like posts and comments
- 👤 **User Profiles** - Customizable profiles with Gravatar integration
- 🔄 **Real-time Feed** - Paginated feed with latest posts
- 📊 **Profile Statistics** - Track post likes and comment engagement

### Optional Features
- 🖼️ **Image Uploads** - Attach images to posts (requires S3 configuration)
  - Enabled automatically when S3 environment variables are set
  - Supports AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2, and any S3-compatible storage
  - 5MB file size limit with automatic validation
  - Gracefully disabled when S3 is not configured

### Admin Features
- 🛡️ **Admin Dashboard** - Comprehensive user management
- 👥 **User Administration** - Edit, promote, or delete users
- 🔧 **Role Management** - Grant/revoke admin privileges

### Technical Features
- ⚡ **Redis Caching** - Improved performance with intelligent cache invalidation
- 🎨 **Server-Side Rendering** - Fast initial page loads with Handlebars
- 🔒 **Security Best Practices** - Password hashing, HTTP-only cookies, CSRF protection
- 📱 **Responsive Design** - Mobile-first Bootstrap 5 interface
- 🧪 **Unit Tested** - Jest test coverage for critical components
- ☁️ **Optional Cloud Storage** - S3-compatible storage for images (AWS, MinIO, DigitalOcean, etc.)

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** MySQL 8
- **Cache:** Redis (ioredis)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Upload:** Multer
- **Cloud Storage (Optional):** AWS SDK v3 (S3-compatible)

### Frontend
- **Template Engine:** Handlebars (express-handlebars)
- **CSS Framework:** Bootstrap 5
- **Icons:** Font Awesome, Bootstrap Icons
- **JavaScript:** Vanilla JS with modern ES6+ features

### DevOps
- **Containerization:** Docker
- **Process Manager:** PM2
- **Testing:** Jest, ts-jest
- **Build Tool:** TypeScript Compiler

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Redis 6.0+
- (Optional) Docker and Docker Compose
- (Optional) AWS account for S3 or any S3-compatible provider

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OmairSalman/UsersConnect.git
   cd usersconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```sql
   CREATE DATABASE usersconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # JWT Secrets (use strong random strings)
   # Generate with: openssl rand -hex 32
   ACCESS_TOKEN_SECRET=your-access-token-secret-here
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
   
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=usersconnect
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PASSWORD=
   
   # Optional: S3 Configuration (see below for setup)
   # S3_ACCESS_KEY=
   # S3_SECRET_KEY=
   # S3_BUCKET_NAME=
   # S3_REGION=
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

The application will be available at `http://localhost:3000`

---

## 🖼️ S3 Image Uploads (Optional)

UsersConnect supports **optional** image uploads in posts using any S3-compatible storage provider. This feature is **automatically enabled** when you configure the S3 environment variables, and **gracefully disabled** when they're not set.

### How It Works

- **With S3 configured:** Users see an image upload field when creating/editing posts
- **Without S3 configured:** Image upload fields are hidden, all other features work normally

### Supported Providers

- ✅ **AWS S3** - Industry standard
- ✅ **MinIO** - Self-hosted, free and open source
- ✅ **DigitalOcean Spaces** - Simple pricing
- ✅ **Cloudflare R2** - No egress fees
- ✅ **Backblaze B2** - Cost-effective
- ✅ **Any S3-compatible service**

### Enabling S3 Storage

Add these environment variables to `.env`:

```bash
# S3 Configuration
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=usersconnect-media
S3_REGION=us-east-1

# For non-AWS providers, set custom endpoint:
# S3_ENDPOINT=http://localhost:9000  # MinIO example
# S3_PUBLIC_URL=https://cdn.example.com  # Optional CDN
```

**That's it!** The application automatically detects S3 configuration and enables image upload features.

### Without S3

The application works perfectly without S3 configuration - posts simply won't have image upload capability. All other features remain fully functional.

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

**Option 1: Basic Deployment (No Images)**

```yaml
version: '3.8'

services:
  app:
    image: omairsalman/usersconnect:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ACCESS_TOKEN_SECRET=your-access-secret-here
      - REFRESH_TOKEN_SECRET=your-refresh-secret-here
      - DATABASE_HOST=mysql
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=yourpassword
      - DATABASE_NAME=usersconnect
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: yourpassword
      MYSQL_DATABASE: usersconnect
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

**Option 2: With AWS S3**

Add to app environment:
```yaml
      - S3_ACCESS_KEY=your-aws-access-key
      - S3_SECRET_KEY=your-aws-secret-key
      - S3_BUCKET_NAME=usersconnect-media
      - S3_REGION=us-east-1
```

**Option 3: With Self-hosted MinIO**

```yaml
version: '3.8'

services:
  app:
    image: omairsalman/usersconnect:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ACCESS_TOKEN_SECRET=your-access-secret-here
      - REFRESH_TOKEN_SECRET=your-refresh-secret-here
      - DATABASE_HOST=mysql
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=yourpassword
      - DATABASE_NAME=usersconnect
      - REDIS_HOST=redis
      # MinIO Configuration
      - S3_ACCESS_KEY=minioadmin
      - S3_SECRET_KEY=minioadmin
      - S3_BUCKET_NAME=usersconnect-media
      - S3_REGION=us-east-1
      - S3_ENDPOINT=http://minio:9000
    depends_on:
      - mysql
      - redis
      - minio

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: yourpassword
      MYSQL_DATABASE: usersconnect
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  minio-setup:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 5;
      mc alias set myminio http://minio:9000 minioadmin minioadmin;
      mc mb myminio/usersconnect-media --ignore-existing;
      mc anonymous set download myminio/usersconnect-media;
      exit 0;
      "

volumes:
  mysql_data:
  redis_data:
  minio_data:
```

### Docker Commands

```bash
# Pull latest image
docker pull omairsalman/usersconnect:latest

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## 📁 Project Structure

```
usersconnect/
├── src/
│   ├── config/              # Configuration (DB, Redis, types)
│   ├── controllers/         # Request handlers
│   │   ├── api/            # REST API endpoints
│   │   └── web/            # Page rendering
│   ├── middlewares/         # Express middlewares
│   │   ├── auth/           # Authentication checks
│   │   └── validation/     # Input validation
│   ├── entities/            # TypeORM entities
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── postService.ts
│   │   ├── commentService.ts
│   │   ├── userService.ts
│   │   └── s3Service.ts    # S3 upload handling (optional)
│   ├── routers/             # Route definitions
│   ├── utils/               # Helper functions and DTOs
│   │   └── s3Config.ts     # S3 configuration checker
│   ├── views/               # Handlebars templates
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── partials/
│   ├── public/              # Static assets
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── tests/               # Jest tests
├── dist/                    # Compiled JavaScript
├── Dockerfile
├── docker-compose.yml       # Basic version
├── docker-compose-s3.yml    # S3-enabled version
├── package.json
└── tsconfig.json
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `POST /auth/verify-password` - Verify password

### Users
- `GET /users` - Get all users (admin)
- `GET /users/search?search=term` - Search users
- `GET /users/:id` - Get user by ID (admin)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:userId/posts` - Get user's posts
- `PUT /users/:userId/toggle-admin` - Toggle admin status (admin)

### Posts
- `GET /posts` - Get all posts (paginated)
- `GET /posts/:postId` - Get single post
- `POST /posts` - Create post (with optional image if S3 configured)
- `PUT /posts/:postId` - Update post
- `DELETE /posts/:postId` - Delete post
- `POST /posts/:postId/like` - Like post
- `DELETE /posts/:postId/like` - Unlike post

### Comments
- `POST /comments/:postId` - Add comment
- `PUT /comments/:commentId` - Update comment
- `DELETE /comments/:commentId` - Delete comment
- `POST /comments/:commentId/like` - Like comment
- `DELETE /comments/:commentId/like` - Unlike comment

### Web Pages
- `GET /` - Home page
- `GET /feed` - User feed (authenticated)
- `GET /profile` - Current user profile
- `GET /profile/:userId` - View user profile
- `GET /admin/users` - Admin dashboard (admin)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## ☁️ AWS S3 Setup Tutorial

Complete guide to setting up AWS S3 for image uploads.

### Prerequisites
- AWS Account ([sign up here](https://aws.amazon.com/))

### Step 1: Create S3 Bucket

1. **Sign in to AWS Console:** https://console.aws.amazon.com/
2. **Navigate to S3:** Search for "S3" in the services search
3. **Create Bucket:**
   - Click "Create bucket"
   - **Bucket name:** `usersconnect-media` (must be globally unique)
   - **AWS Region:** `us-east-1` (or closest to your users)
   - **Block Public Access:** Uncheck "Block all public access"
   - Acknowledge the warning
   - Click "Create bucket"

### Step 2: Configure Bucket Policy

1. **Open bucket** → **Permissions** tab
2. **Bucket policy** → Click "Edit"
3. **Paste this policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::usersconnect-media/*"
    }
  ]
}
```

4. Replace `usersconnect-media` with your bucket name
5. Click "Save changes"

**What this does:** Allows public read access so browsers can display images.

### Step 3: Create IAM User

1. **Navigate to IAM:** Search for "IAM" in services
2. **Users** → **Create user**
3. **User name:** `usersconnect-app`
4. Click "Next"
5. **Permissions:** "Attach policies directly"
6. Click "Create policy" (opens new tab)
7. **In new tab:**
   - Select "JSON" tab
   - Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::usersconnect-media/*"
    }
  ]
}
```

   - Click "Next"
   - **Policy name:** `UsersConnectS3Access`
   - Click "Create policy"

8. **Return to user creation** → Refresh → Select `UsersConnectS3Access`
9. Click "Next" → "Create user"

### Step 4: Create Access Keys

1. Click on `usersconnect-app` user
2. **Security credentials** tab
3. **Access keys** → **Create access key**
4. Select "Application running outside AWS"
5. Click "Next" → "Create access key"
6. **⚠️ SAVE THESE - You can't see them again!**
   - **Access key ID** (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Secret access key** (e.g., `wJalrXUtnFEMI/K7MDENG/...`)

### Step 5: Configure UsersConnect

Add to `.env`:

```bash
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=wJal...
S3_BUCKET_NAME=usersconnect-media
S3_REGION=us-east-1
```

### Step 6: Test

1. Restart application
2. Create a post with an image
3. Image should upload successfully
4. Check S3 bucket → Should see file in `posts/` folder

### Cost Estimate

**Free tier (first 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

**After free tier:**
- Storage: $0.023 per GB/month
- PUT: $0.005 per 1,000 requests
- GET: $0.0004 per 1,000 requests

**Example:** 1000 users, 10 posts each, 500KB images
- ~5 GB = **$0.12/month**
- ~10k PUT + 100k GET = **$0.09/month**
- **Total: ~$0.21/month**

### Alternative: MinIO (Free, Self-Hosted)

For development or self-hosting, see the Docker Compose MinIO example above. MinIO is 100% free and S3-compatible.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built during summer field training at **[AsalTech](https://asaltech.com/)**
- Special thanks to my backend development mentor for guidance
- Bootstrap team for the CSS framework
- TypeORM team for the robust ORM
- All open-source contributors

---

## 👨‍💻 Author

**Omair Salman**

- GitHub: [@OmairSalman](https://github.com/OmairSalman)
- Email: OmairSalman@outlook.com

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/OmairSalman/UsersConnect/issues)
- **Discussions:** [GitHub Discussions](https://github.com/OmairSalman/UsersConnect/discussions)
- **Email:** OmairSalman@outlook.com

---

⭐ **Star this repository if you find it helpful!**
