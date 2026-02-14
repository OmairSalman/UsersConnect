import Redis from "ioredis";
import 'dotenv/config';
import logger from './logger';

const redisClient = new Redis(
  {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'usersconnect:'
  }
);

redisClient.on("connect", () => {logger.info("Connected to Redis cache successfully.")})

redisClient.on('error', (err: Error) => {
  logger.error('Redis Client Error:', err);
});

export default redisClient;