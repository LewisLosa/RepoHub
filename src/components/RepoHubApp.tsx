"use client"

import { useState } from 'react'
import { PlatformSelector } from '@/components/PlatformSelector'
import { PackageBrowser } from '@/components/PackageBrowser'
import { SelectionManager } from '@/components/SelectionManager'
import { ScriptPreview } from '@/components/ScriptPreview'
import { generateScript } from '@/lib/scriptGenerator'
import { Platform, Package, SelectedPackage, FilterOptions, GeneratedScript } from '@/types'

export function RepoHubApp() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([])
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null)

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform)
    // Clear selections when platform changes
    setSelectedPackages([])
    setGeneratedScript(null)
  }

  const handlePackageToggle = (pkg: Package) => {
    setSelectedPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id)
      if (exists) {
        return prev.filter(p => p.id !== pkg.id)
      } else {
        return [...prev, { ...pkg, selectedAt: new Date().toISOString() }]
      }
    })
  }

  const handlePackageRemove = (pkgId: string) => {
    setSelectedPackages(prev => prev.filter(p => p.id !== pkgId))
  }

  const handleClearAll = () => {
    setSelectedPackages([])
  }

  const handleGenerateScript = () => {
    if (selectedPlatform && selectedPackages.length > 0) {
      const script = generateScript(selectedPackages, selectedPlatform)
      setGeneratedScript(script)
    }
  }

  const handleFiltersChange = (filters: FilterOptions) => {
    // Filters are handled internally by PackageBrowser
    // This could be expanded to handle URL params or state management
  }

  const handleCloseScriptPreview = () => {
    setGeneratedScript(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RepoHub
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Cross-Platform Package Manager
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Simplify software installation across Linux, Windows, and macOS with official repositories
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Platform Selector */}
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onPlatformSelect={handlePlatformSelect}
          />

          {/* Package Browser */}
          <PackageBrowser
            selectedPlatform={selectedPlatform}
            selectedPackages={selectedPackages}
            onPackageToggle={handlePackageToggle}
            onFiltersChange={handleFiltersChange}
          />

          {/* Selection Manager */}
          <SelectionManager
            selectedPackages={selectedPackages}
            onPackageRemove={handlePackageRemove}
            onClearAll={handleClearAll}
            onGenerateScript={handleGenerateScript}
          />
        </div>

        {/* Script Preview Modal */}
        {generatedScript && (
          <ScriptPreview
            generatedScript={generatedScript}
            selectedPackages={selectedPackages}
            selectedPlatform={selectedPlatform}
            onClose={handleCloseScriptPreview}
          />
        )}
      </div>
    </div>
  )
}
