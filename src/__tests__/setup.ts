import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Global test setup
beforeAll(async () => {
  console.log('🚀 Starting test suite...')
})

afterAll(async () => {
  console.log('✅ Test suite completed')
})

// Reset database state before each test if needed
beforeEach(async () => {
  // Clean up test data if needed
})

afterEach(async () => {
  // Additional cleanup
})
