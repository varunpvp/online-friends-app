import Redis from "ioredis";

export const createRedisClient = () => {
  const redis = new Redis(process.env.REDIS_URL!, { family: 6 });

  return redis;
};
