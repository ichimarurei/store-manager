import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? '';
const REDIS_PREFIX = process.env.REDIS_PREFIX ?? '';

const redis = new Redis(REDIS_URL, { keyPrefix: REDIS_PREFIX });

export default redis;
