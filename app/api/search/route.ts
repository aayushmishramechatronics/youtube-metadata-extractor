import { NextResponse } from "next/server"

// YouTube API allows max 50 results per request
const MAX_RESULTS_PER_REQUEST = 50
const TOTAL_RESULTS_NEEDED = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key is not configured" }, { status: 500 })
    }

    // First request to get initial results
    const firstRequestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${MAX_RESULTS_PER_REQUEST}&type=video&key=${apiKey}`
    const firstResponse = await fetch(firstRequestUrl)
    const firstData = await firstResponse.json()

    if (!firstResponse.ok) {
      return NextResponse.json(
        { error: firstData.error?.message || "YouTube API error" },
        { status: firstResponse.status },
      )
    }

    let videos = [...firstData.items]

    // If we need more results and there's a nextPageToken, make a second request
    if (videos.length < TOTAL_RESULTS_NEEDED && firstData.nextPageToken) {
      const secondRequestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${TOTAL_RESULTS_NEEDED - videos.length}&pageToken=${firstData.nextPageToken}&type=video&key=${apiKey}`
      const secondResponse = await fetch(secondRequestUrl)
      const secondData = await secondResponse.json()

      if (secondResponse.ok) {
        videos = [...videos, ...secondData.items]
      }
    }

    // Limit to exactly 60 results if we have more
    videos = videos.slice(0, TOTAL_RESULTS_NEEDED)

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching YouTube data:", error)
    return NextResponse.json({ error: "Failed to fetch YouTube data" }, { status: 500 })
  }
}
