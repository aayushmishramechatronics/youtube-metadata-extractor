"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

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

interface VideoResultsProps {
  videos: Video[]
}

export default function VideoResults({ videos }: VideoResultsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {videos.map((video) => (
        <Card key={video.id.videoId} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
                    alt={video.snippet.title}
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
              <div className="p-4 flex-1">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium hover:text-blue-600 transition-colors"
                >
                  {video.snippet.title}
                </a>
                <p className="text-sm text-gray-500 mt-1">
                  {video.snippet.channelTitle} •{" "}
                  {formatDistanceToNow(new Date(video.snippet.publishedAt), { addSuffix: true })}
                </p>
                <p className="mt-2 text-sm line-clamp-3">{video.snippet.description}</p>
                <div className="mt-2 text-xs text-gray-400">ID: {video.id.videoId}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
