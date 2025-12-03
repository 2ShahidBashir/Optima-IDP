const redisClient = require('../config/redis');
const logger = require('../config/logger');

const DEFAULT_TTL = 3600; // Default Time-To-Live: 1 hour in seconds

/**
 * Cache Service
 * ----------------------------------------------------
 * Provides helper functions to interact with Redis cache.
 * Wraps Redis commands with error handling and JSON parsing.
 */

/**
 * Get value from cache
 * ----------------------------------------------------
 * Retrieves a value by key from Redis.
 * 
 * @param {string} key - The cache key to retrieve
 * @returns {Promise<any>} - Parsed JSON object or null if not found/error
 */
const get = async (key) => {
    try {
        const data = await redisClient.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        logger.error(`Cache GET error for key ${key}:`, error);
        return null;
    }
};

/**
 * Set value in cache
 * ----------------------------------------------------
 * Stores a value in Redis with an expiration time.
 * 
 * @param {string} key - The cache key to set
 * @param {any} value - The data to store (will be JSON stringified)
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 1 hour)
 */
const set = async (key, value, ttlSeconds = DEFAULT_TTL) => {
    try {
        await redisClient.set(key, JSON.stringify(value), {
            EX: ttlSeconds
        });
    } catch (error) {
        logger.error(`Cache SET error for key ${key}:`, error);
    }
};

/**
 * Delete value from cache
 * ----------------------------------------------------
 * Removes a key from Redis.
 * 
 * @param {string} key - The cache key to remove
 */
const del = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        logger.error(`Cache DEL error for key ${key}:`, error);
    }
};

module.exports = {
    get,
    set,
    del
};
