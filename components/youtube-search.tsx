"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Download, Search } from "lucide-react"
import VideoResults from "./video-results"
import { exportToExcel } from "@/lib/excel-export"

interface Video {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    description: string
    thumbnails: {
      medium: {
        url: string
      }
    }
  }
}

export default function YouTubeSearch() {
  const [query, setQuery] = useState("")
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch results")
      }

      setVideos(data.videos)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (videos.length === 0) return

    const data = videos.map((video) => ({
      "Video ID": video.id.videoId,
      Title: video.snippet.title,
      Channel: video.snippet.channelTitle,
      "Published Date": new Date(video.snippet.publishedAt).toLocaleDateString(),
      Description: video.snippet.description,
    }))

    exportToExcel(data, `youtube-search-${query}-${new Date().toISOString().split("T")[0]}`)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter search keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </form>
      </Card>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {videos.length} Results for "{query}"
            </h2>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
          <VideoResults videos={videos} />
        </div>
      )}

      {!loading && !error && videos.length === 0 && query && (
        <div className="text-center py-8 text-gray-500">
          No videos found for "{query}". Try a different search term.
        </div>
      )}
    </div>
  )
}
