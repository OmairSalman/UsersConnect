import Redis from "ioredis";
import { config } from './index';
import logger from './logger';

const redisClient = new Redis(
  {
    host: config.redis.host,
    port: 6379,
    password: config.redis.password,
    keyPrefix: 'usersconnect:'
  }
);

redisClient.on("connect", () => {logger.info("Connected to Redis cache successfully.")})

redisClient.on('error', (err: Error) => {
  logger.error('Redis Client Error:', err);
});

export default redisClient;