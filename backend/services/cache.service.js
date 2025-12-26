const simpleCache = new Map();
const logger = require('../config/logger');

const DEFAULT_TTL = 3600; // Default Time-To-Live: 1 hour in seconds

/**
 * Cache Service (In-Memory Version)
 * ----------------------------------------------------
 * Provides helper functions to interact with an in-memory cache.
 * Replaces the previous Redis implementation.
 */

/**
 * Cleanup expired keys
 * Rough implementation to prevent memory leaks
 */
const cleanup = () => {
    const now = Date.now();
    for (const [key, value] of simpleCache.entries()) {
        if (value.expiry < now) {
            simpleCache.delete(key);
        }
    }
};

// Run cleanup every 10 minutes
setInterval(cleanup, 10 * 60 * 1000).unref();

/**
 * Get value from cache
 * ----------------------------------------------------
 * Retrieves a value by key.
 * 
 * @param {string} key - The cache key to retrieve
 * @returns {Promise<any>} - Parsed object or null if not found/expired
 */
const get = async (key) => {
    try {
        if (!simpleCache.has(key)) {
            return null;
        }

        const item = simpleCache.get(key);
        
        // Check expiry
        if (item.expiry < Date.now()) {
            simpleCache.delete(key);
            return null;
        }

        return item.value;
    } catch (error) {
        logger.error(`Cache GET error for key ${key}:`, error);
        return null;
    }
};

/**
 * Set value in cache
 * ----------------------------------------------------
 * Stores a value in memory with an expiration time.
 * 
 * @param {string} key - The cache key to set
 * @param {any} value - The data to store
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 1 hour)
 */
const set = async (key, value, ttlSeconds = DEFAULT_TTL) => {
    try {
        const expiry = Date.now() + (ttlSeconds * 1000);
        simpleCache.set(key, {
            value,
            expiry
        });
    } catch (error) {
        logger.error(`Cache SET error for key ${key}:`, error);
    }
};

/**
 * Delete value from cache
 * ----------------------------------------------------
 * Removes a key.
 * 
 * @param {string} key - The cache key to remove
 */
const del = async (key) => {
    try {
        simpleCache.delete(key);
    } catch (error) {
        logger.error(`Cache DEL error for key ${key}:`, error);
    }
};

module.exports = {
    get,
    set,
    del
};
