// src/config/database.ts
import mongoose from 'mongoose';

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Ansluten till MongoDB');
  } catch (error) {
    console.error('Kunde inte ansluta till MongoDB:', error);
    process.exit(1);
  }
}

export { connectToDatabase };