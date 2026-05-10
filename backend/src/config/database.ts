// src/config/database.ts
import mongoose from 'mongoose';

// Läser connection string från miljövariabler och ansluter Mongoose till MongoDB.
async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  // Vi stoppar uppstarten direkt om servern saknar databasinställning.
  if (!mongoUri) {
    throw new Error("Ingen MONGO_URI satt.");
  }

  await mongoose.connect(mongoUri);
  console.log('Ansluten till MongoDB');
}

export { connectToDatabase };
