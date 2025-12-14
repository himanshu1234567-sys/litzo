import mongoose from "mongoose"

const getMongoDBUri = () => {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
  }
  return MONGODB_URI
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongooseGlobal

if (!cached) {
  cached = global.mongooseGlobal = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log("[v0] Using cached DB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    const uri = getMongoDBUri()
    console.log("[v0] Creating new DB connection...")
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log("[v0] MongoDB connected successfully")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("[v0] MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}

export default connectDB
