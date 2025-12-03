const { createClient } = require('redis');
const logger = require('./logger');

/**
 * Redis Client Configuration
 * ----------------------------------------------------
 * Initializes and connects to the Redis server.
 * Used for caching API responses and managing queues.
 */

// Create Redis client instance
const redisClient = createClient({
    // Connection URL from environment variables or default to localhost
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Event listener for Redis errors
redisClient.on('error', (err) => logger.error('Redis Client Error', err));

// Event listener for successful connection
redisClient.on('connect', () => logger.info('Redis Client Connected'));

/**
 * Connect to Redis
 * ----------------------------------------------------
 * Asynchronously connects to the Redis server.
 * Logs success or failure.
 */
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
    }
};

// Initiate connection
connectRedis();

module.exports = redisClient;
