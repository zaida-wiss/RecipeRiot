// src/config/database.ts
import mongoose from 'mongoose';

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('Ingen MONGO_URI satt. Startar utan databasanslutning.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Ansluten till MongoDB');
  } catch (error) {
    console.warn('Kunde inte ansluta till MongoDB, fortsätter utan databas:', error);
  }
}

export { connectToDatabase };