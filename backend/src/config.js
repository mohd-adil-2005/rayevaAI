/** Environment-based config. No secrets in code. */
import dotenv from 'dotenv';

// Load .env and allow it to override IDE / system placeholders
// (Cursor and other tools sometimes set OPENAI_API_KEY=sk-your-... globally).
dotenv.config({ override: true });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rayeva',
  // LLM provider and key (we support DeepSeek via OPENAI_API_KEY env here)
  llmProvider: process.env.LLM_PROVIDER || 'deepseek',
  llmApiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  useMockAi: process.env.USE_MOCK_AI === 'true',
};
