import { query } from '@/lib/database/config'
import { Platform, CreatePlatformInput, UpdatePlatformInput } from '@/models/Platform'

export class PlatformService {
  // Get all platforms
  static async getAll(): Promise<Platform[]> {
    const result = await query('SELECT * FROM platforms ORDER BY name')
    return result.rows
  }

  // Get platform by ID
  static async getById(id: string): Promise<Platform | null> {
    const result = await query('SELECT * FROM platforms WHERE id = $1', [id])
    return result.rows[0] || null
  }

  // Create new platform
  static async create(data: CreatePlatformInput): Promise<Platform> {
    const { id, name, package_manager, icon } = data
    const result = await query(
      `INSERT INTO platforms (id, name, package_manager, icon) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [id, name, package_manager, icon]
    )
    return result.rows[0]
  }

  // Update platform
  static async update(id: string, data: UpdatePlatformInput): Promise<Platform | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`)
      values.push(data.name)
    }
    if (data.package_manager !== undefined) {
      fields.push(`package_manager = $${paramIndex++}`)
      values.push(data.package_manager)
    }
    if (data.icon !== undefined) {
      fields.push(`icon = $${paramIndex++}`)
      values.push(data.icon)
    }

    if (fields.length === 0) {
      return this.getById(id)
    }

    values.push(id)
    const result = await query(
      `UPDATE platforms SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  }

  // Delete platform
  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM platforms WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  }

  // Check if platform exists
  static async exists(id: string): Promise<boolean> {
    const result = await query('SELECT 1 FROM platforms WHERE id = $1 LIMIT 1', [id])
    return result.rows.length > 0
  }
}
