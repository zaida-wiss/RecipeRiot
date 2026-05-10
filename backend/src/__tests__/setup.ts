import { afterAll, afterEach, beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// Startar en tillfällig MongoDB i minnet innan testerna körs.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Tömmer databasen efter varje test så tester inte påverkar varandra.
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

// Stänger både Mongoose och in-memory databasen efter testsviten.
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
