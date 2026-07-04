import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'backups')
  const filename = `backup-${timestamp}.sql`

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }

  try {
    console.log('Starting database backup...')
    const { stderr } = await execAsync(`pg_dump "${databaseUrl}" > "${path.join(backupDir, filename)}"`)
    if (stderr) console.warn('Backup warning:', stderr)
    console.log(`Backup completed: ${filename}`)

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql')).sort().reverse()
    files.slice(7).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file))
      console.log(`Removed old backup: ${file}`)
    })
  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  }
}

backupDatabase()
