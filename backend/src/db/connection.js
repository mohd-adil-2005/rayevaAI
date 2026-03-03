import mongoose from 'mongoose';
import { config } from '../config.js';

let dbConnected = false;

export function isDbConnected() {
  return dbConnected;
}

export async function connectDb() {
  const uri = config.mongodbUri || 'mongodb://localhost:27017/rayeva';
  try {
    await mongoose.connect(uri);
    dbConnected = true;
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.warn('MongoDB not available:', err.message);
    console.warn('Server will start but API routes will return 503 until MongoDB is running.');
    dbConnected = false;
    return false;
  }
}
