const redisClient = require('../config/redis');
const logger = require('../config/logger');

/**
 * Queue Service
 * ----------------------------------------------------
 * Manages asynchronous job queues using Redis.
 * Pushes recommendation jobs to be processed by Python worker.
 */

const QUEUE_NAME = 'recommendation_queue';

/**
 * Add a recommendation job to the queue.
 * 
 * @param {Object} jobData - Data required for recommendation (userId, skills, etc.)
 * @returns {Promise<boolean>} - True if successful
 */
const addJob = async (jobData) => {
    try {
        const job = JSON.stringify({
            id: Date.now().toString(),
            data: jobData,
            timestamp: new Date().toISOString()
        });

        // Push to the right end of the list (Queue)
        await redisClient.rPush(QUEUE_NAME, job);

        logger.info(`Job added to queue: ${jobData.userId}`);
        return true;
    } catch (error) {
        logger.error('Queue Add Error:', error);
        return false;
    }
};

module.exports = {
    addJob
};
