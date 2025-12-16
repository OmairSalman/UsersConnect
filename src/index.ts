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

import dotenv from 'dotenv';
import hbsHelpers from './views/helpers/hbsHelpers';

dotenv.config();

const app = express();

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: hbsHelpers
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection with retry logic
async function connectWithRetry(retries = 10, delay = 5000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      console.log(`✅ Data Source initialized! Connected to MySQL DB: ${process.env.DATABASE_NAME}`);
      return;
    } catch (error) {
      const remainingRetries = retries - i - 1;
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed.`);
      
      if (remainingRetries > 0) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds... (${remainingRetries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("💥 Failed to connect to database after all retry attempts.");
        console.error("Error details:", error);
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
  
  // Start listening
  app.listen(process.env.PORT, () => { 
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}/`);
  });
}

startServer();