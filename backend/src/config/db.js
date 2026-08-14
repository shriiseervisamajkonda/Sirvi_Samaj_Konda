import mongoose from 'mongoose';

// Disable query buffering when DB connection is not established to prevent server hangs/crashes
mongoose.set('bufferCommands', false);

// Catch database connection event errors to prevent process crashes
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection event error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected.');
});

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) {
    while (mongoose.connection.readyState !== 1 && isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }
  try {
    isConnecting = true;
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fast fail in 5s if database is offline/blocked
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Initial Connection Error: ${error.message}`);
  } finally {
    isConnecting = false;
  }
};

export const ensureDbConnected = (_req, _res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  connectDB()
    .then(() => next())
    .catch((err) => {
      console.warn('Database connection warning during request:', err.message);
      next();
    });
};

export default connectDB;
