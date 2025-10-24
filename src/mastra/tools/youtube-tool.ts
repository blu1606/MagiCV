import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * YouTube MCP Tool - Thu thập dữ liệu từ YouTube channel
 * Crawl: channel info, video list, statistics
 * Note: Requires YOUTUBE_API_KEY in environment variables
 */
export const youtubeTool = createTool({
  id: "youtube-crawler",
  description: "Crawl YouTube channel data including videos, statistics, and content information",
  
  inputSchema: z.object({
    channelUrl: z.string().describe("YouTube channel URL or handle"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      channel: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        customUrl: z.string().optional(),
        subscriberCount: z.string(),
        videoCount: z.string(),
        viewCount: z.string(),
        thumbnails: z.object({
          default: z.string().optional(),
          medium: z.string().optional(),
          high: z.string().optional(),
        }),
      }),
      videos: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        publishedAt: z.string(),
        thumbnails: z.object({
          default: z.string().optional(),
          medium: z.string().optional(),
          high: z.string().optional(),
        }),
        viewCount: z.string().optional(),
        likeCount: z.string().optional(),
        commentCount: z.string().optional(),
      })),
      statistics: z.object({
        totalVideos: z.number(),
        totalViews: z.string(),
        totalSubscribers: z.string(),
        avgViewsPerVideo: z.number(),
      }),
    }).optional(),
    error: z.string().optional(),
  }),

  execute: async ({ context }) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY not found in environment variables');
      }

      // Extract channel handle or ID from URL
      let channelIdentifier = context.channelUrl;
      
      // Handle different URL formats
      if (channelIdentifier.includes('youtube.com')) {
        const match = channelIdentifier.match(/youtube\.com\/@([^\/\?]+)/);
        if (match) {
          channelIdentifier = '@' + match[1];
        }
      }

      console.log(`🔍 Fetching YouTube data for: ${channelIdentifier}`);

      // First, search for channel by handle/username
      let channelId = '';
      
      if (channelIdentifier.startsWith('@')) {
        const searchResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/search`,
          {
            params: {
              part: 'snippet',
              q: channelIdentifier,
              type: 'channel',
              key: apiKey,
              maxResults: 1,
            }
          }
        );

        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
          channelId = searchResponse.data.items[0].id.channelId;
        } else {
          throw new Error(`Channel not found: ${channelIdentifier}`);
        }
      } else {
        channelId = channelIdentifier;
      }

      // Fetch channel details
      const channelResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels`,
        {
          params: {
            part: 'snippet,statistics,contentDetails',
            id: channelId,
            key: apiKey,
          }
        }
      );

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = channelResponse.data.items[0];
      const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

      // Fetch videos from uploads playlist
      const videosResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/playlistItems`,
        {
          params: {
            part: 'snippet',
            playlistId: uploadsPlaylistId,
            maxResults: 20,
            key: apiKey,
          }
        }
      );

      const videoIds = videosResponse.data.items.map((item: any) => item.snippet.resourceId.videoId);

      // Fetch video statistics
      let videoDetails: any[] = [];
      if (videoIds.length > 0) {
        const videoStatsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos`,
          {
            params: {
              part: 'snippet,statistics',
              id: videoIds.join(','),
              key: apiKey,
            }
          }
        );
        videoDetails = videoStatsResponse.data.items;
      }

      // Format videos
      const videos = videoDetails.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnails: {
          default: video.snippet.thumbnails?.default?.url,
          medium: video.snippet.thumbnails?.medium?.url,
          high: video.snippet.thumbnails?.high?.url,
        },
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount,
        commentCount: video.statistics?.commentCount,
      }));

      // Calculate statistics
      const totalViews = videos.reduce((sum, video) => sum + parseInt(video.viewCount || '0'), 0);
      const avgViewsPerVideo = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

      return {
        success: true,
        data: {
          channel: {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            customUrl: channel.snippet.customUrl,
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
            viewCount: channel.statistics.viewCount,
            thumbnails: {
              default: channel.snippet.thumbnails?.default?.url,
              medium: channel.snippet.thumbnails?.medium?.url,
              high: channel.snippet.thumbnails?.high?.url,
            },
          },
          videos,
          statistics: {
            totalVideos: videos.length,
            totalViews: totalViews.toString(),
            totalSubscribers: channel.statistics.subscriberCount,
            avgViewsPerVideo,
          },
        },
      };
    } catch (error: any) {
      console.error('❌ YouTube crawl error:', error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  },
});

