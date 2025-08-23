import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';
dotenv.config();
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });
