
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Define an interface for our cached connection
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // We use 'var' to declare it as a global variable
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// Initialize 'cached' using the global variable
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;