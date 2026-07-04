import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('⚠️ DATABASE_URL not found in environment variables')
  console.error('Please check your .env.local file')
}

const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export const db = sql ? drizzle(sql, { schema }) : null as any

export type DbClient = typeof db
