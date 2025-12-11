# UsersConnect 🌐

A full-stack social media platform built with Node.js, Express, and TypeScript. Create posts, comment, like, and connect with users in a modern, responsive interface.

**Live Demo:** [https://usersconnect.cloudomair.org/](https://usersconnect.cloudomair.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running with Docker](#running-with-docker)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

### User Features
- 🔐 **Secure Authentication** - JWT-based auth with access/refresh token pattern
- 📝 **Post Management** - Create, edit, and delete posts with rich text content
- 💬 **Interactive Comments** - Nested comment system with real-time updates
- 👍 **Social Engagement** - Like posts and comments
- 👤 **User Profiles** - Customizable profiles with Gravatar integration
- 🔄 **Real-time Feed** - Paginated feed with latest posts
- 📊 **Profile Statistics** - Track post likes and comment engagement

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

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** MySQL 8
- **Cache:** Redis (ioredis)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt

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

## 📸 Screenshots

<!-- Add screenshots here once available -->
*Screenshots coming soon!*

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Redis 6.0+
- (Optional) Docker and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OmairSalman/UsersConnect
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
   
   # Optional
   GRAVATAR_API_KEY=your-gravatar-key
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

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | - | Environment mode (`development` or `production`) |
| `PORT` | Yes | 3000 | Port number for the server |
| `ACCESS_TOKEN_SECRET` | Yes | - | Secret key for JWT access tokens (15min expiry) |
| `REFRESH_TOKEN_SECRET` | Yes | - | Secret key for JWT refresh tokens (30d expiry) |
| `DATABASE_HOST` | Yes | - | MySQL server hostname |
| `DATABASE_USERNAME` | Yes | - | MySQL username |
| `DATABASE_PASSWORD` | Yes | - | MySQL password |
| `DATABASE_NAME` | Yes | - | MySQL database name |
| `REDIS_HOST` | Yes | - | Redis server hostname |
| `REDIS_PASSWORD` | No | - | Redis password (if authentication enabled) |
| `GRAVATAR_API_KEY` | No | - | Gravatar API key (optional) |

### Running with Docker

#### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Using Pre-built Image

```bash
docker pull omairsalman/usersconnect:latest

docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e ACCESS_TOKEN_SECRET=your-secret \
  -e REFRESH_TOKEN_SECRET=your-secret \
  -e DATABASE_HOST=your-mysql-host \
  -e DATABASE_USERNAME=root \
  -e DATABASE_PASSWORD=password \
  -e DATABASE_NAME=usersconnect \
  -e REDIS_HOST=your-redis-host \
  omairsalman/usersconnect:latest
```

#### Building Your Own Image

```bash
# Build the TypeScript code first
npm run build

# Build Docker image
docker build -t usersconnect .

# Run the container
docker run -d -p 3000:3000 --env-file .env usersconnect
```

## 📁 Project Structure

```
usersconnect/
├── src/
│   ├── config/           # Configuration files (DB, Redis, TypeScript types)
│   ├── controllers/      # Request handlers
│   │   ├── api/         # REST API controllers
│   │   └── web/         # Web page controllers
│   ├── middlewares/     # Express middlewares (auth, validation)
│   ├── models/          # TypeORM entities
│   ├── services/        # Business logic layer
│   ├── routers/         # Route definitions
│   ├── utils/           # Helper functions and DTOs
│   ├── views/           # Handlebars templates
│   │   ├── layouts/    # Layout templates
│   │   ├── pages/      # Page templates
│   │   └── partials/   # Reusable components
│   ├── public/          # Static assets (CSS, JS, images)
│   └── tests/           # Jest test files
├── dist/                # Compiled JavaScript (generated)
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies
└── README.md           # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `POST /auth/verify-password` - Verify user password

### Users
- `GET /users` - Get all users (admin only)
- `GET /users/search?search=term` - Search users
- `GET /users/:id` - Get user by ID (admin only)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:userId/posts` - Get user's posts
- `PUT /users/:userId/toggle-admin` - Toggle admin status (admin only)

### Posts
- `GET /posts` - Get all posts (paginated)
- `GET /posts/:postId` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/:postId` - Update post (author only)
- `DELETE /posts/:postId` - Delete post (author only)
- `POST /posts/:postId/like` - Like post
- `DELETE /posts/:postId/like` - Unlike post

### Comments
- `POST /comments/:postId` - Add comment to post
- `PUT /comments/:commentId` - Update comment (author only)
- `DELETE /comments/:commentId` - Delete comment (author only)
- `POST /comments/:commentId/like` - Like comment
- `DELETE /comments/:commentId/like` - Unlike comment

### Web Pages
- `GET /` - Home page
- `GET /feed` - User feed (authenticated)
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /profile` - Current user profile
- `GET /profile/:userId` - View user profile
- `GET /profile/edit` - Edit profile page
- `GET /admin/users` - Admin user management (admin only)
- `GET /about` - About page
- `GET /privacy` - Privacy policy
- `GET /terms` - Terms of service
- `GET /contact` - Contact page

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Building for Production

```bash
# Install production dependencies
npm install --production

# Build TypeScript
npm run build

# The dist/ folder contains the compiled application
```

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name usersconnect

# View logs
pm2 logs usersconnect

# Monitor
pm2 monit

# Save configuration
pm2 save
pm2 startup
```

### Environment Considerations

- Set `NODE_ENV=production` in production
- Use strong, randomly generated secrets for JWT tokens
- Enable Redis password authentication
- Use SSL/TLS for database connections
- Implement rate limiting for public endpoints
- Set up proper logging and monitoring
- Use a reverse proxy (nginx, Caddy) for HTTPS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow existing TypeScript conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of university field training requirements
- Bootstrap team for the excellent CSS framework
- TypeORM team for the robust ORM
- All open-source contributors whose libraries made this possible

## 👨‍💻 Author

**Omair Salman**

- GitHub: [@OmairSalman](https://github.com/OmairSalman)

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/OmairSalman/UsersConnect/issues)
2. Create a new issue with detailed information
3. Contact: admin@usersconnect.com

---

⭐ Star this repository if you find it helpful!
