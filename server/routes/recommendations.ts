import { RequestHandler } from "express";
import { RecommendationRequest, RecommendationResponse } from "@shared/recommendation";
import { RecommendationService } from "../services/recommendation";

const recommendationService = new RecommendationService();

export const getRecommendations: RequestHandler = async (req, res) => {
  try {
    const { query, platform, limit } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required and must be a string'
      });
    }

    const request: RecommendationRequest = {
      query,
      platform: platform as 'spotify' | 'youtube' | 'both' || 'both',
      limit: limit ? parseInt(limit as string) : 20
    };

    // Validate limit
    if (request.limit && (request.limit < 1 || request.limit > 50)) {
      return res.status(400).json({
        error: 'Limit must be between 1 and 50'
      });
    }

    const recommendations = await recommendationService.getRecommendations(request);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getStatus: RequestHandler = (req, res) => {
  try {
    const status = recommendationService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const searchTracks: RequestHandler = async (req, res) => {
  try {
    const { query, platform } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required and must be a string'
      });
    }

    // This endpoint just searches without similarity matching
    const request: RecommendationRequest = {
      query,
      platform: platform as 'spotify' | 'youtube' | 'both' || 'both',
      limit: 20
    };

    const recommendations = await recommendationService.getRecommendations(request);
    
    // Return just the tracks without similarity scores for simple search
    const tracks = recommendations.results.map(r => r.track);
    
    res.json({
      tracks,
      query: request.query,
      totalFound: recommendations.totalFound
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
