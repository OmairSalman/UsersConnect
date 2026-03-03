// config must be imported first — it loads and validates all configuration
// (including env vars and config.yaml) before any other module reads process.env.
import 'dotenv/config';
import { config } from './config';

import express from 'express';
import path from 'path';

import { engine } from 'express-handlebars';
import cookieParser from "cookie-parser";

import WebRouter from './routers/web/webRouter';
import UserRouter from './routers/api/userRouter';
import AuthRouter from './routers/api/authRouter';
import PostRouter from './routers/api/postRouter';
import CommentRouter from './routers/api/commentRouter';

import AppDataSource from './config/dataSource';

import hbsHelpers from './views/helpers/hbsHelpers';

import logger from './config/logger';
import ConfigRouter from './routers/api/configRouter';

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
app.use((req, res, next) => {
  // Allow requests from Angular dev server
  res.header('Access-Control-Allow-Origin', 'http://192.168.1.3:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: hbsHelpers
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Disable view caching in development
if (process.env.NODE_ENV !== 'production') {
  app.disable('view cache');
}

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection with retry logic
async function connectWithRetry(retries = 10, delay = 5000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      logger.info(`✅ Data Source initialized! Connected to MySQL DB: ${process.env.DATABASE_NAME}`);
      return;
    } catch (error) {
      const remainingRetries = retries - i - 1;
      logger.error(`❌ Database connection attempt ${i + 1}/${retries} failed.`);
      
      if (remainingRetries > 0) {
        logger.info(`⏳ Retrying in ${delay / 1000} seconds... (${remainingRetries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error("💥 Failed to connect to database after all retry attempts.");
        logger.error("Error details:", error);
        process.exit(1);
      }
    }
  }
}

async function startServer() {
  await connectWithRetry();
  
  // Register routes
  app.use('/', WebRouter);
  app.use('/users', UserRouter);
  app.use('/auth', AuthRouter);
  app.use('/posts', PostRouter);
  app.use('/comments', CommentRouter);
  app.use('/config', ConfigRouter);
  
  // Internal port is fixed to match Dockerfile EXPOSE 3000.
  // Use Docker port mapping for external port changes: docker run -p 8080:3000
  const PORT = 3000;
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
}

startServer();