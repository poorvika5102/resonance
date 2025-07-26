export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  popularity?: number;
  acousticness?: number;
  danceability?: number;
  energy?: number;
  valence?: number;
  tempo?: number;
  platform: 'spotify' | 'youtube';
  thumbnailUrl?: string;
  externalUrl?: string;
}

export interface RecommendationRequest {
  query: string;
  platform?: 'spotify' | 'youtube' | 'both';
  limit?: number;
  features?: {
    genre?: string;
    acousticness?: number;
    danceability?: number;
    energy?: number;
    valence?: number;
  };
}

export interface RecommendationResult {
  track: Track;
  similarity: number;
  matchedFeatures: string[];
}

export interface RecommendationResponse {
  results: RecommendationResult[];
  query: string;
  processingTime: number;
  totalFound: number;
}

export interface PlatformAdapter {
  searchTracks(query: string, limit?: number): Promise<Track[]>;
  getTrackFeatures(trackId: string): Promise<Partial<Track>>;
  isConfigured(): boolean;
}

export interface SimilarityMetrics {
  textSimilarity: number;
  audioFeatureSimilarity: number;
  genreSimilarity: number;
  overallSimilarity: number;
}
