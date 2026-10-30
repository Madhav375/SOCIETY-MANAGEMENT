const mongoose = require("mongoose");
const { config } = require("./env");

mongoose.set("strictQuery", true);

async function connectMongo() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log("MongoDB connected");
}

/** true when the Mongo connection is currently usable (readyState 1). */
const mongoReady = () => mongoose.connection.readyState === 1;

async function pingMongo() {
  if (!mongoReady()) return false;
  await mongoose.connection.db.admin().ping();
  return true;
}

module.exports = { connectMongo, mongoReady, pingMongo, mongoose };
