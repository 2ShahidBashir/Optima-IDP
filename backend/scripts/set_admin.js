require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address');
    console.log('Usage: node scripts/set_admin.js <email>');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`Successfully promoted ${user.name} (${user.email}) to ADMIN`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

connectDB();
