export interface Platform {
  id: string
  name: string
  packageManager: string
  icon: string
}

export interface Package {
  id: string
  name: string
  description: string
  version: string
  category: string
  license: string
  type: 'gui' | 'cli'
  platform: string
  repository: 'official' | 'third-party'
  lastUpdated: string
  downloads?: number
  popularity?: number
  tags: string[]
}

export interface FilterOptions {
  platforms: string[]
  categories: string[]
  licenses: string[]
  types: ('gui' | 'cli')[]
  repositories: ('official' | 'third-party')[]
  searchQuery: string
}

export interface SelectedPackage extends Package {
  selectedAt: string
}

export interface GeneratedScript {
  platform: string
  script: string
  packages: SelectedPackage[]
  generatedAt: string
}
