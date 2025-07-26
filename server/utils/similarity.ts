import { Track, SimilarityMetrics } from "@shared/recommendation";

export class SimilarityEngine {
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate text similarity using enhanced Jaccard similarity with partial matching
   */
  private textSimilarity(text1: string, text2: string): number {
    const normalize = (text: string) =>
      text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);

    const words1 = new Set(normalize(text1));
    const words2 = new Set(normalize(text2));

    // Exact word matches
    const exactIntersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    let exactSimilarity = union.size === 0 ? 0 : exactIntersection.size / union.size;

    // Partial word matching for better artist name similarity
    let partialMatches = 0;
    const totalComparisons = words1.size * words2.size;

    if (totalComparisons > 0) {
      for (const word1 of words1) {
        for (const word2 of words2) {
          if (word1.length >= 3 && word2.length >= 3) {
            if (word1.includes(word2) || word2.includes(word1)) {
              partialMatches++;
            } else if (word1.length >= 4 && word2.length >= 4) {
              // Check for close matches (e.g., "Vijay" vs "Vijaya")
              const editDistance = this.levenshteinDistance(word1, word2);
              if (editDistance <= Math.max(1, Math.min(word1.length, word2.length) * 0.2)) {
                partialMatches += 0.8;
              }
            }
          }
        }
      }

      const partialSimilarity = partialMatches / Math.max(words1.size, words2.size);
      exactSimilarity = Math.max(exactSimilarity, partialSimilarity * 0.8);
    }

    return Math.min(1, exactSimilarity);
  }

  /**
   * Calculate edit distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate genre similarity
   */
  private genreSimilarity(genre1?: string, genre2?: string): number {
    if (!genre1 || !genre2) return 0;
    
    const g1 = genre1.toLowerCase();
    const g2 = genre2.toLowerCase();
    
    if (g1 === g2) return 1;
    
    // Genre hierarchies and similarities could be more sophisticated
    const genreGroups = [
      ['pop', 'dance pop', 'electropop'],
      ['rock', 'alternative rock', 'indie rock', 'hard rock'],
      ['hip hop', 'rap', 'trap', 'hip-hop'],
      ['electronic', 'edm', 'house', 'techno', 'dubstep'],
      ['r&b', 'soul', 'neo soul'],
      ['country', 'folk', 'americana'],
      ['jazz', 'blues', 'funk'],
      ['classical', 'orchestral', 'chamber music']
    ];

    for (const group of genreGroups) {
      if (group.includes(g1) && group.includes(g2)) {
        return 0.7; // Related genres
      }
    }

    return 0;
  }

  /**
   * Calculate audio feature similarity using cosine similarity
   */
  private audioFeatureSimilarity(track1: Track, track2: Track): number {
    const features = ['acousticness', 'danceability', 'energy', 'valence', 'tempo'];
    
    const vector1: number[] = [];
    const vector2: number[] = [];

    for (const feature of features) {
      const value1 = (track1 as any)[feature];
      const value2 = (track2 as any)[feature];
      
      if (typeof value1 === 'number' && typeof value2 === 'number') {
        if (feature === 'tempo') {
          // Normalize tempo (typically 60-200 BPM) to 0-1 range
          vector1.push((value1 - 60) / 140);
          vector2.push((value2 - 60) / 140);
        } else {
          vector1.push(value1);
          vector2.push(value2);
        }
      }
    }

    if (vector1.length === 0) return 0;
    
    return Math.max(0, this.cosineSimilarity(vector1, vector2));
  }

  /**
   * Calculate overall similarity between two tracks
   */
  calculateSimilarity(referenceTrack: Track, candidateTrack: Track): SimilarityMetrics {
    // Calculate individual similarity metrics
    const titleSimilarity = this.textSimilarity(referenceTrack.title, candidateTrack.title);
    const artistSimilarity = this.textSimilarity(referenceTrack.artist, candidateTrack.artist);

    // Enhanced text similarity - give more weight to exact artist matches
    let textSim = titleSimilarity;
    if (artistSimilarity > 0.7) {
      // Strong artist match - boost overall text similarity
      textSim = Math.max(titleSimilarity, 0.85 + (artistSimilarity - 0.7) * 0.5);
    } else if (artistSimilarity > 0.3) {
      // Partial artist match
      textSim = Math.max(titleSimilarity, artistSimilarity * 0.9);
    }

    const genreSim = this.genreSimilarity(referenceTrack.genre, candidateTrack.genre);
    const audioSim = this.audioFeatureSimilarity(referenceTrack, candidateTrack);

    // Enhanced weighted combination - prioritize artist matching for same-artist searches
    let weights = {
      text: 0.5,
      genre: 0.2,
      audio: 0.3
    };

    // If searching by artist name specifically, boost text similarity weight
    if (artistSimilarity > 0.7) {
      weights = {
        text: 0.7,
        genre: 0.15,
        audio: 0.15
      };
    }

    let overallSimilarity =
      textSim * weights.text +
      genreSim * weights.genre +
      audioSim * weights.audio;

    // Boost scores for same artist tracks
    if (artistSimilarity > 0.8) {
      overallSimilarity = Math.min(1, overallSimilarity + 0.1);
    }

    // Apply minimum thresholds for same artist
    if (artistSimilarity > 0.7) {
      overallSimilarity = Math.max(overallSimilarity, 0.75);
    }

    return {
      textSimilarity: textSim,
      audioFeatureSimilarity: audioSim,
      genreSimilarity: genreSim,
      overallSimilarity: Math.min(1, overallSimilarity)
    };
  }

  /**
   * Find the best matching tracks from a candidate list
   */
  findBestMatches(
    referenceTrack: Track, 
    candidates: Track[], 
    limit: number = 10,
    minSimilarity: number = 0.1
  ): Array<{ track: Track; similarity: number; metrics: SimilarityMetrics }> {
    const results = candidates
      .map(candidate => {
        const metrics = this.calculateSimilarity(referenceTrack, candidate);
        return {
          track: candidate,
          similarity: metrics.overallSimilarity,
          metrics
        };
      })
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  /**
   * Analyze what features contributed most to a match
   */
  explainSimilarity(metrics: SimilarityMetrics): string[] {
    const explanations: string[] = [];
    
    if (metrics.textSimilarity > 0.7) {
      explanations.push('Strong title/artist match');
    } else if (metrics.textSimilarity > 0.3) {
      explanations.push('Partial title/artist match');
    }
    
    if (metrics.genreSimilarity > 0.9) {
      explanations.push('Same genre');
    } else if (metrics.genreSimilarity > 0.5) {
      explanations.push('Similar genre');
    }
    
    if (metrics.audioFeatureSimilarity > 0.8) {
      explanations.push('Very similar audio features');
    } else if (metrics.audioFeatureSimilarity > 0.6) {
      explanations.push('Similar audio features');
    }

    return explanations.length > 0 ? explanations : ['General similarity'];
  }
}
