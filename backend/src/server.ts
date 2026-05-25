// src/server.ts
import 'dotenv/config';
import app from './app.js';
import { connectToDatabase } from './config/database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Servern lyssnar på http://localhost:${PORT}`);
  });
}

startServer();
