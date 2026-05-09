// src/config/database.ts
import mongoose from 'mongoose';

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Ingen MONGO_URI satt.");
  }

  await mongoose.connect(mongoUri);
  console.log('Ansluten till MongoDB');
}

export { connectToDatabase };