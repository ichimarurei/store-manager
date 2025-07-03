'use server';

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? '';
const REDIS_PREFIX = process.env.REDIS_PREFIX ?? '';

const redis = new Redis(`redis://${REDIS_URL}`, {
    keyPrefix: REDIS_PREFIX,
    reconnectOnError: ({ message }) => message?.includes('READONLY') ?? false,
    retryStrategy: (times) => Math.min(times * 100, 2500) // max delay of 2500ms
});

export default redis;
