"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { platforms } from '@/data/mockData'
import { Platform } from '@/types'

interface PlatformSelectorProps {
  selectedPlatform: Platform | null
  onPlatformSelect: (platform: Platform) => void
}

export function PlatformSelector({ selectedPlatform, onPlatformSelect }: PlatformSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Your Platform</CardTitle>
        <CardDescription>
          Choose your operating system and package manager to browse available packages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              variant={selectedPlatform?.id === platform.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => onPlatformSelect(platform)}
            >
              <div className="text-2xl">{platform.icon}</div>
              <div className="text-center">
                <div className="font-semibold">{platform.name}</div>
                <div className="text-sm text-muted-foreground">{platform.packageManager}</div>
              </div>
            </Button>
          ))}
        </div>
        {selectedPlatform && (
          <div className="mt-4 p-4 bg-secondary rounded-md">
            <p className="text-sm">
              <strong>Selected:</strong> {selectedPlatform.name} ({selectedPlatform.packageManager})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
