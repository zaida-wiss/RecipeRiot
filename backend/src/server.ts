// src/server.ts
import 'dotenv/config';
import cron from 'node-cron';
import app from './app.js';
import { connectToDatabase } from './config/database.js';
import { env } from './config/env.js';
import { cleanupExpiredSoftDeletedData } from './controllers/gdprController.js';

const startServer = async (): Promise<void> => {
  await connectToDatabase();
  app.listen(env.PORT, () => {
    console.log(`Servern lyssnar på http://localhost:${env.PORT}`);
  });

  // Schemalägga GDPR cleanup varje dag kl. 02:00
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupExpiredSoftDeletedData();
    } catch (error) {
      console.error('[GDPR Cleanup Error]', error);
    }
  });
};

void startServer();
