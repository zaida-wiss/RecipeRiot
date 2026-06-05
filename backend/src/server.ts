// src/server.ts
import 'dotenv/config';
import app from './app.js';
import { connectToDatabase } from './config/database.js';
import { env } from './config/env.js';


const startServer = async (): Promise<void> => {
  await connectToDatabase();
  app.listen(env.PORT, () => {
    console.log(`Servern lyssnar på http://localhost:${env.PORT}`);
  });
};

void startServer();
