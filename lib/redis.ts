import { Redis } from "ioredis"

// Redis Cloud configuration
const redisConfig = {
  host: process.env.REDIS_HOST || "redis-13468873.c123.us-east-1-4.ec2.cloud.redislabs.com",
  port: parseInt(process.env.REDIS_PORT || "13468"),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

// Fallback to REDIS_URL if provided (for backward compatibility)
const redisUrl = process.env.REDIS_URL

const redis = redisUrl 
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })
  : new Redis(redisConfig)

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Connected to Redis Cloud')
})

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error)
})

redis.on('ready', () => {
  console.log('🚀 Redis Cloud is ready')
})

redis.on('close', () => {
  console.log('🔌 Redis connection closed')
})

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCachedData(key: string, data: any, ttl = 300): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

export async function deleteCachedData(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error("Redis pattern invalidation error:", error)
  }
}

export default redis
