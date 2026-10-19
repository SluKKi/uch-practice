import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { seedAdmin } from './seed.js';
import authRoutes from './routes/auth.routes.js';
import requestRoutes from './routes/request.routes.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);

async function startServer() {
  try {
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
