import mongoose from "mongoose";

export const setupDB = async () => {
  const mongoUri = "mongodb://localhost:27017/securedoc-ai-test";
  process.env.MONGO_URI = mongoUri;
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
};

export const teardownDB = async () => {
  await mongoose.disconnect();
};

export const clearDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};
