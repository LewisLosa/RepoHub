export interface Platform {
  id: string
  name: string
  package_manager: string
  icon?: string
  created_at: Date
  updated_at: Date
}

export interface CreatePlatformInput {
  id: string
  name: string
  package_manager: string
  icon?: string
}

export interface UpdatePlatformInput {
  name?: string
  package_manager?: string
  icon?: string
}
