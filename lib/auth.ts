import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import type { User } from "../generated/prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" })
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: string, refreshToken: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  return prisma.session.create({
    data: {
      userId,
      refreshToken: await bcrypt.hash(refreshToken, 10),
      expiresAt,
    },
  })
}

export async function validateSession(refreshToken: string): Promise<User | null> {
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  })

  for (const session of sessions) {
    const isValid = await bcrypt.compare(refreshToken, session.refreshToken)
    if (isValid) {
      return session.user
    }
  }

  return null
}

export async function revokeSession(refreshToken: string) {
  const sessions = await prisma.session.findMany()

  for (const session of sessions) {
    const isMatch = await bcrypt.compare(refreshToken, session.refreshToken)
    if (isMatch) {
      await prisma.session.delete({
        where: { id: session.id },
      })
      break
    }
  }
}
