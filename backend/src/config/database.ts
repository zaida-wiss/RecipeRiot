// src/config/database.ts
import mongoose from 'mongoose';
import { env } from "./env"

export const connectToDatabase= async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Ansluten till MongoDB');
  } catch (error) {
    console.error('Kunde inte ansluta till MongoDB:', error);
    process.exit(1);
  }
}
