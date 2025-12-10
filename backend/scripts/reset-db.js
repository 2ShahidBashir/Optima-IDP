const mongoose = require('mongoose');
const { createClient } = require('redis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetDatabase = async () => {
    console.log('⚠️  Starting Database Reset...');

    // 1. Clear MongoDB
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/optima_idp';
        await mongoose.connect(mongoUri);
        console.log(`✅ Connected to MongoDB: ${mongoUri}`);

        await mongoose.connection.db.dropDatabase();
        console.log('🗑️  MongoDB Database Dropped');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ MongoDB Error:', error);
    }

    // 2. Clear Redis
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const redisClient = createClient({ url: redisUrl });

        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        await redisClient.connect();
        console.log(`✅ Connected to Redis: ${redisUrl}`);

        await redisClient.flushAll();
        console.log('🗑️  Redis Cache Flushed');

        await redisClient.disconnect();
    } catch (error) {
        console.error('❌ Redis Error:', error);
    }

    console.log('✨ Database Reset Complete');
    process.exit(0);
};

resetDatabase();
