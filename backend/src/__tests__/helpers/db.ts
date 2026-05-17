import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | undefined;

async function connect() {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.29',
    },
    instance: {
      dbName: 'reciperiot-test',
    },
  });

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

async function clearDatabase() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { connect, clearDatabase, disconnect };