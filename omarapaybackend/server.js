import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

app.use('/api/users', userRoutes);

// app.get('/', (req, res) => {
//   res.send('Hello, world from Backend');
// });

const PORT = process.env.PORT || 5000;
// make server listen on 0.0.0.0 so devices (phone) can connect to host machine
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
