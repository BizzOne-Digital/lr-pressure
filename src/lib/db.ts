import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Cached connection object. In serverless environments (Vercel, AWS Lambda, etc.)
 * the module scope can persist across invocations of the same warm instance, so
 * caching the connection here avoids exhausting MongoDB's connection limit by
 * opening a fresh connection on every request.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForMongoose = global as any;

const cached: MongooseCache =
  globalForMongoose.__mongooseCache ?? { conn: null, promise: null };

if (!globalForMongoose.__mongooseCache) {
  globalForMongoose.__mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file (see .env.example)."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

/** Returns the native MongoDB driver Db instance, useful for GridFS. */
export async function getDb() {
  const m = await connectToDatabase();
  if (!m.connection.db) {
    throw new Error("MongoDB connection has no db handle yet.");
  }
  return m.connection.db;
}
