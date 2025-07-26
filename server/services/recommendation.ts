import { 
  RecommendationRequest, 
  RecommendationResponse, 
  RecommendationResult, 
  Track 
} from "@shared/recommendation";
import { SpotifyAdapter } from "../adapters/spotify";
import { YouTubeAdapter } from "../adapters/youtube";
import { SimilarityEngine } from "../utils/similarity";

export class RecommendationService {
  private spotifyAdapter: SpotifyAdapter;
  private youtubeAdapter: YouTubeAdapter;
  private similarityEngine: SimilarityEngine;

  constructor() {
    this.spotifyAdapter = new SpotifyAdapter();
    this.youtubeAdapter = new YouTubeAdapter();
    this.similarityEngine = new SimilarityEngine();
  }

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Search for the reference track(s)
      const referenceTrack = await this.findReferenceTrack(request.query);
      
      if (!referenceTrack) {
        return {
          results: [],
          query: request.query,
          processingTime: Date.now() - startTime,
          totalFound: 0
        };
      }

      // Step 2: Search for candidates across platforms
      const candidates = await this.searchCandidates(request);
      
      // Step 3: Calculate similarities and rank results
      const recommendations = this.rankCandidates(referenceTrack, candidates, request.limit || 20);
      
      return {
        results: recommendations,
        query: request.query,
        processingTime: Date.now() - startTime,
        totalFound: candidates.length
      };
    } catch (error) {
      console.error('Recommendation error:', error);
      return {
        results: [],
        query: request.query,
        processingTime: Date.now() - startTime,
        totalFound: 0
      };
    }
  }

  private async findReferenceTrack(query: string): Promise<Track | null> {
    // Try to find the best reference track from available platforms
    const spotifyResults = await this.spotifyAdapter.searchTracks(query, 5);
    const youtubeResults = await this.youtubeAdapter.searchTracks(query, 5);
    
    // Prefer Spotify for reference due to better metadata
    if (spotifyResults.length > 0) {
      const track = spotifyResults[0];
      // Enhance with audio features
      const features = await this.spotifyAdapter.getTrackFeatures(track.id);
      return { ...track, ...features };
    }
    
    if (youtubeResults.length > 0) {
      const track = youtubeResults[0];
      const features = await this.youtubeAdapter.getTrackFeatures(track.id);
      return { ...track, ...features };
    }
    
    return null;
  }

  private async searchCandidates(request: RecommendationRequest): Promise<Track[]> {
    const candidates: Track[] = [];
    const searchLimit = 50; // Get many more candidates for comprehensive results
    
    const platforms = request.platform === 'both' || !request.platform ? ['spotify', 'youtube'] : [request.platform];
    
    // Search across selected platforms
    if (platforms.includes('spotify')) {
      try {
        const spotifyTracks = await this.spotifyAdapter.searchTracks(request.query, searchLimit);
        // Enhance Spotify tracks with audio features
        for (const track of spotifyTracks) {
          const features = await this.spotifyAdapter.getTrackFeatures(track.id);
          candidates.push({ ...track, ...features });
        }
      } catch (error) {
        console.error('Spotify search failed:', error);
      }
    }
    
    if (platforms.includes('youtube')) {
      try {
        const youtubeTracks = await this.youtubeAdapter.searchTracks(request.query, searchLimit);
        // Enhance YouTube tracks with estimated features
        for (const track of youtubeTracks) {
          const features = await this.youtubeAdapter.getTrackFeatures(track.id);
          candidates.push({ ...track, ...features });
        }
      } catch (error) {
        console.error('YouTube search failed:', error);
      }
    }
    
    return candidates;
  }

  private rankCandidates(
    referenceTrack: Track, 
    candidates: Track[], 
    limit: number
  ): RecommendationResult[] {
    
    const matches = this.similarityEngine.findBestMatches(
      referenceTrack,
      candidates.filter(c => c.id !== referenceTrack.id), // Exclude exact same track
      limit,
      0.05 // Lower threshold for more inclusive results
    );

    return matches.map(match => ({
      track: match.track,
      similarity: match.similarity,
      matchedFeatures: this.similarityEngine.explainSimilarity(match.metrics)
    }));
  }

  /**
   * Get platform status for debugging
   */
  getStatus() {
    return {
      spotify: {
        configured: this.spotifyAdapter.isConfigured(),
        available: true
      },
      youtube: {
        configured: this.youtubeAdapter.isConfigured(),
        available: true
      }
    };
  }

  /**
   * Cross-platform track matching - find the same song on different platforms
   */
  async findCrossPlatformMatches(track: Track): Promise<Track[]> {
    const query = `${track.artist} ${track.title}`;
    const otherPlatform = track.platform === 'spotify' ? 'youtube' : 'spotify';
    
    const adapter = otherPlatform === 'spotify' ? this.spotifyAdapter : this.youtubeAdapter;
    const candidates = await adapter.searchTracks(query, 10);
    
    const matches = this.similarityEngine.findBestMatches(track, candidates, 5, 0.6);
    
    return matches.map(match => match.track);
  }
}
