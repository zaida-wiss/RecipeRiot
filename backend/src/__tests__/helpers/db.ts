import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

async function connect() { mongoServer = await MongoMemoryServer.create();  
const uri = mongoServer.getUri();  
await mongoose.connect(uri);}

async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

module.exports = {connect, clearDatabase, disconnect};
