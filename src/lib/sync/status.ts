// Global sync state (in production, use Redis or database)
let syncInProgress = false
let syncProgress = { message: '', progress: 0, total: 100 }

// Export functions for other endpoints to use
export function setSyncProgress(message: string, progress?: number, total?: number) {
  syncProgress = { message, progress: progress || 0, total: total || 100 }
}

export function setSyncInProgress(inProgress: boolean) {
  syncInProgress = inProgress
}

export function getSyncStatus() {
  return {
    inProgress: syncInProgress,
    progress: syncProgress
  }
}
