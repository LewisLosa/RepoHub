import { exec } from 'child_process'
import { promisify } from 'util'
import { PackageService } from './packageService'
import { PlatformService } from './platformService'
import { CreatePackageInput } from '@/models/Package'

const execAsync = promisify(exec)

export class MetadataFetcher {
  // Fetch Ubuntu/Debian package metadata
  static async fetchUbuntuPackages(): Promise<void> {
    console.log('🔄 Starting Ubuntu/Debian package metadata fetch...')
    
    try {
      // Update package lists
      console.log('📦 Updating apt package lists...')
      await execAsync('apt-get update')
      
      // Get package list
      console.log('📋 Getting package list...')
      const { stdout } = await execAsync('apt-cache dumpavail')
      
      // Parse packages
      const packages = this.parseAptPackages(stdout)
      console.log(`📊 Found ${packages.length} packages`)
      
      // Store in database
      await this.storePackages('ubuntu', packages)
      
      console.log('✅ Ubuntu/Debian package metadata fetch completed')
    } catch (error) {
      console.error('❌ Error fetching Ubuntu packages:', error)
      throw error
    }
  }

  // Parse apt-cache dumpavail output
  private static parseAptPackages(output: string): CreatePackageInput[] {
    const packages: CreatePackageInput[] = []
    const blocks = output.split('\n\n')
    
    for (const block of blocks) {
      if (!block.trim()) continue
      
      const pkg: any = {}
      const lines = block.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('Package: ')) {
          pkg.id = line.substring(9).trim()
          pkg.name = pkg.id
        } else if (line.startsWith('Description: ')) {
          pkg.description = line.substring(13).trim()
        } else if (line.startsWith('Version: ')) {
          pkg.version = line.substring(9).trim()
        } else if (line.startsWith('Homepage: ')) {
          pkg.homepage_url = line.substring(10).trim()
        }
      }
      
      if (pkg.id && pkg.name) {
        packages.push({
          ...pkg,
          platform_id: 'ubuntu',
          type: this.determinePackageType(pkg.name, pkg.description),
          repository: 'official',
          popularity_score: Math.floor(Math.random() * 100) // Placeholder
        })
      }
    }
    
    return packages
  }

  // Determine if package is GUI or CLI
  private static determinePackageType(name: string, description?: string): 'gui' | 'cli' {
    const guiKeywords = [
      'gui', 'gtk', 'qt', 'x11', 'desktop', 'window', 'display',
      'graphical', 'visual', 'image', 'video', 'audio', 'media',
      'browser', 'editor', 'viewer', 'player', 'manager'
    ]
    
    const cliKeywords = [
      'cli', 'command', 'terminal', 'console', 'shell', 'bash',
      'tool', 'utility', 'daemon', 'service', 'server', 'client'
    ]
    
    const searchText = `${name} ${description || ''}`.toLowerCase()
    
    for (const keyword of guiKeywords) {
      if (searchText.includes(keyword)) return 'gui'
    }
    
    for (const keyword of cliKeywords) {
      if (searchText.includes(keyword)) return 'cli'
    }
    
    // Default to CLI for system packages
    return 'cli'
  }

  // Store packages in database
  private static async storePackages(platformId: string, packages: CreatePackageInput[]): Promise<void> {
    console.log(`💾 Storing ${packages.length} packages for platform ${platformId}...`)
    
    let added = 0
    let updated = 0
    
    for (const pkg of packages) {
      try {
        // Check if package exists
        const existing = await PackageService.getById(pkg.id)
        
        if (existing) {
          // Update existing package
          await PackageService.update(pkg.id, {
            description: pkg.description,
            version: pkg.version,
            homepage_url: pkg.homepage_url,
            type: pkg.type,
            repository: pkg.repository,
            popularity_score: pkg.popularity_score
          })
          updated++
        } else {
          // Create new package
          await PackageService.create(pkg)
          added++
        }
      } catch (error) {
        console.error(`Error storing package ${pkg.id}:`, error)
      }
    }
    
    console.log(`📈 Added: ${added}, Updated: ${updated}`)
  }

  // Fetch package categories from Ubuntu
  static async fetchUbuntuCategories(): Promise<void> {
    console.log('🏷️ Fetching Ubuntu package categories...')
    
    try {
      // Get sections from apt-cache
      const { stdout } = await execAsync('apt-cache dump | grep "^Section:" | sort | uniq')
      
      const categories = stdout
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace('Section:', '').trim())
        .filter(category => category && category !== 'unknown')
      
      console.log(`📋 Found ${categories.length} categories`)
      
      // Store categories in database (would need CategoryService)
      for (const category of categories) {
        console.log(`  - ${category}`)
      }
      
    } catch (error) {
      console.error('❌ Error fetching Ubuntu categories:', error)
    }
  }

  // Get popular packages from Ubuntu popularity contest
  static async getPopularUbuntuPackages(limit: number = 100): Promise<string[]> {
    try {
      // Try to get popularity contest data
      const { stdout } = await execAsync('popularity-contest -a 2>/dev/null || echo ""')
      
      if (stdout) {
        const packages = stdout
          .split('\n')
          .filter(line => line.includes('POP-CON-Package'))
          .map(line => line.split(' ')[1])
          .slice(0, limit)
        
        return packages
      }
      
      // Fallback: return some common packages
      return [
        'curl', 'wget', 'git', 'vim', 'nano', 'firefox', 'chromium-browser',
        'libreoffice', 'gimp', 'vlc', 'audacity', 'thunderbird', 'code'
      ]
    } catch (error) {
      console.error('Error getting popular packages:', error)
      return []
    }
  }

  // Sync metadata for a specific platform
  static async syncPlatform(platformId: string): Promise<void> {
    console.log(`🔄 Starting metadata sync for platform: ${platformId}`)
    
    const startTime = Date.now()
    
    try {
      switch (platformId) {
        case 'ubuntu':
          await this.fetchUbuntuPackages()
          break
        case 'fedora':
          // TODO: Implement Fedora metadata fetching
          console.log('⏳ Fedora metadata fetching not yet implemented')
          break
        case 'arch':
          // TODO: Implement Arch metadata fetching
          console.log('⏳ Arch metadata fetching not yet implemented')
          break
        case 'windows':
          // TODO: Implement Windows metadata fetching
          console.log('⏳ Windows metadata fetching not yet implemented')
          break
        case 'macos':
          // TODO: Implement macOS metadata fetching
          console.log('⏳ macOS metadata fetching not yet implemented')
          break
        default:
          throw new Error(`Unsupported platform: ${platformId}`)
      }
      
      const duration = Date.now() - startTime
      console.log(`✅ Sync completed for ${platformId} in ${duration}ms`)
      
    } catch (error) {
      console.error(`❌ Sync failed for ${platformId}:`, error)
      throw error
    }
  }

  // Sync all platforms
  static async syncAllPlatforms(): Promise<void> {
    console.log('🔄 Starting metadata sync for all platforms...')
    
    const platforms = await PlatformService.getAll()
    
    for (const platform of platforms) {
      try {
        await this.syncPlatform(platform.id)
      } catch (error) {
        console.error(`Failed to sync ${platform.name}:`, error)
      }
    }
    
    console.log('✅ All platforms sync completed')
  }
}
