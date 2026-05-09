import 'dotenv/config';
import app from './app';
import { connectToDatabase } from "./config/database";

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Servern lyssnar på http://localhost:${PORT}`);
  });
}

startServer();
