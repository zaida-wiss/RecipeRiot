import "dotenv/config";
import app from "./app";
import { connectToDatabase } from "./config/database";

const PORT = process.env.PORT || 3000;

// Servern startas först efter att databasanslutningen fungerar.
async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Servern lyssnar på http://localhost:${PORT}`);
  });
}

// Fångar fel vid uppstart, till exempel saknad MONGO_URI eller misslyckad databasanslutning.
startServer().catch((error) => {
  console.error("Kunde inte starta servern:", error);
  process.exit(1);
});
