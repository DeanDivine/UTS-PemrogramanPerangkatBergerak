import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
 console.log(`API running at http://0.0.0.0:${PORT}`);
});
