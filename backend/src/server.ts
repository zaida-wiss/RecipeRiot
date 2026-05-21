// src/server.ts
import 'dotenv/config';
import app from './app';
import { env } from "./config/env";
import { connectToDatabase } from './config/database';

export const startServer() = async(): Promise<void> => {
  await connectToDatabase();
  app.listen(env.PORT, () => {
    console.log(`Servern lyssnar på http://localhost:${PORT}`);
  });
}

startServer();