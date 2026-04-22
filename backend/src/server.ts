// src/server.ts
import 'dotenv/config';
import app from './app';
import { connectToDatabase } from './config/db';

//Läser port från .env, annars 3000
const port = Number(process.env.PORT) || 3000;

const startServer = async (): Promise <void> => {
  try {
    // 1) Koppla databas
    await connectToDatabase();

    // 2) Starta server först när DB fungerar
    app.listen(port,() => {
      console.log(`Servern lyssnar på http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Servern kunde inte starta:', error);
    process.exit(1);
  }
};

void startServer();
