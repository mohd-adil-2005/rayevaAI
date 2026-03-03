import express from 'express';
import cors from 'cors';
import { connectDb, isDbConnected } from './db/connection.js';
import { config } from './config.js';
import categoryTagRoutes from './routes/categoryTag.js';
import proposalRoutes from './routes/proposal.js';

const app = express();
app.use(cors());
app.use(express.json());

// Require DB for all /api routes (except health)
app.use('/api', (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      error: 'Database unavailable. Start MongoDB (e.g. mongod) or set MONGODB_URI to a running instance.',
    });
  }
  next();
});

app.use('/api/category-tag', categoryTagRoutes);
app.use('/api/proposal', proposalRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: isDbConnected() ? 'connected' : 'disconnected' });
});

async function start() {
  await connectDb();
  app.listen(config.port, () => {
    console.log(`Rayeva AI backend running at http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
