import mongoose from 'mongoose';

// Catch database connection event errors to prevent process crashes
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection event error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected.');
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fast fail in 5s if database is offline/blocked
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Initial Connection Error: ${error.message}`);
    console.log('Server is running but database operations will fail until connection is resolved.');
  }
};

export default connectDB;
