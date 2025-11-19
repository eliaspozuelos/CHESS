import pool, { query } from '../config/database'
import * as fs from 'fs'
import * as path from 'path'

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...')

    // Check if tables already exist
    const checkQuery = 'SELECT 1 FROM users LIMIT 1'
    try {
      await query(checkQuery)
      console.log('✅ Database tables already exist, skipping initialization')
      return true
    } catch (error) {
      // Tables don't exist, proceed with initialization
      console.log('📦 Creating database tables...')
    }

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    await query(schema)

    console.log('✅ Database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    return false
  }
}

export async function testConnection() {
  try {
    const result = await query('SELECT NOW()')
    console.log('✅ Database connection test successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  }
}

export async function closeDatabase() {
  try {
    await pool.end()
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error closing database:', error)
  }
}
