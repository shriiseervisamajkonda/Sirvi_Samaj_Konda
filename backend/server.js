import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
