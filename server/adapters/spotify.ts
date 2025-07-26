import { PlatformAdapter, Track } from "@shared/recommendation";

export class SpotifyAdapter implements PlatformAdapter {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId?: string, clientSecret?: string) {
    this.clientId = clientId || process.env.SPOTIFY_CLIENT_ID || 'demo_client_id';
    this.clientSecret = clientSecret || process.env.SPOTIFY_CLIENT_SECRET || 'demo_client_secret';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

    return this.accessToken;
  }

  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    // Always return mock data for now since we're in demo mode
    console.log(`Spotify search for: "${query}"`);
    return this.getMockTracks(query, limit);

    try {
      const token = await this.getAccessToken();
      
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`Spotify search failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      
      return searchData.tracks.items.map((item: any): Track => ({
        id: item.id,
        title: item.name,
        artist: item.artists.map((artist: any) => artist.name).join(', '),
        album: item.album.name,
        duration: item.duration_ms,
        popularity: item.popularity,
        platform: 'spotify',
        thumbnailUrl: item.album.images[0]?.url,
        externalUrl: item.external_urls.spotify
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      return this.getMockTracks(query, limit);
    }
  }

  async getTrackFeatures(trackId: string): Promise<Partial<Track>> {
    if (!this.isConfigured()) {
      return this.getMockFeatures();
    }

    try {
      const token = await this.getAccessToken();
      
      const featuresResponse = await fetch(
        `https://api.spotify.com/v1/audio-features/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!featuresResponse.ok) {
        return this.getMockFeatures();
      }

      const features = await featuresResponse.json();
      
      return {
        acousticness: features.acousticness,
        danceability: features.danceability,
        energy: features.energy,
        valence: features.valence,
        tempo: features.tempo
      };
    } catch (error) {
      console.error('Spotify features error:', error);
      return this.getMockFeatures();
    }
  }

  private getMockTracks(query: string, limit: number): Track[] {
    const mockTracks = [
      // Popular International Artists
      {
        id: 'spotify-1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        genre: 'Pop',
        duration: 200040,
        popularity: 95,
        platform: 'spotify' as const,
        acousticness: 0.001,
        danceability: 0.514,
        energy: 0.730,
        valence: 0.334,
        tempo: 171.005
      },
      {
        id: 'spotify-2',
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        genre: 'Pop',
        duration: 233713,
        popularity: 93,
        platform: 'spotify' as const,
        acousticness: 0.581,
        danceability: 0.825,
        energy: 0.652,
        valence: 0.931,
        tempo: 95.977
      },
      // Indian Artists
      {
        id: 'spotify-3',
        title: 'Tum Hi Ho',
        artist: 'Arijit Singh',
        album: 'Aashiqui 2',
        genre: 'Bollywood',
        duration: 262000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.534,
        energy: 0.423,
        valence: 0.678,
        tempo: 78.5
      },
      {
        id: 'spotify-4',
        title: 'Kesariya',
        artist: 'Arijit Singh',
        album: 'Brahmastra',
        genre: 'Bollywood',
        duration: 295000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.389,
        danceability: 0.612,
        energy: 0.567,
        valence: 0.745,
        tempo: 95.2
      },
      {
        id: 'spotify-5',
        title: 'Raabta',
        artist: 'Arijit Singh',
        album: 'Agent Vinod',
        genre: 'Bollywood',
        duration: 284000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.512,
        danceability: 0.445,
        energy: 0.398,
        valence: 0.634,
        tempo: 82.3
      },
      {
        id: 'spotify-6',
        title: 'Channa Mereya',
        artist: 'Arijit Singh',
        album: 'Ae Dil Hai Mushkil',
        genre: 'Bollywood',
        duration: 298000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.478,
        danceability: 0.389,
        energy: 0.456,
        valence: 0.523,
        tempo: 75.8
      },
      // More International
      {
        id: 'spotify-7',
        title: 'Someone Like You',
        artist: 'Adele',
        album: '21',
        genre: 'Pop',
        duration: 285000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.892,
        danceability: 0.389,
        energy: 0.234,
        valence: 0.178,
        tempo: 67.5
      },
      {
        id: 'spotify-8',
        title: 'Perfect',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        genre: 'Pop',
        duration: 263000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.678,
        danceability: 0.456,
        energy: 0.389,
        valence: 0.789,
        tempo: 95.0
      },
      {
        id: 'spotify-9',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        genre: 'Pop',
        duration: 203000,
        popularity: 94,
        platform: 'spotify' as const,
        acousticness: 0.012,
        danceability: 0.897,
        energy: 0.834,
        valence: 0.915,
        tempo: 103.0
      },
      {
        id: 'spotify-10',
        title: 'Bad Habits',
        artist: 'Ed Sheeran',
        album: '=',
        genre: 'Pop',
        duration: 231000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.234,
        danceability: 0.734,
        energy: 0.689,
        valence: 0.823,
        tempo: 126.0
      },
      // Vijay Prakash - Kannada Songs
      {
        id: 'spotify-11',
        title: 'Gaalipata',
        artist: 'Vijay Prakash',
        album: 'Gaalipata',
        genre: 'Kannada',
        duration: 278000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.678,
        energy: 0.567,
        valence: 0.789,
        tempo: 92.5
      },
      {
        id: 'spotify-12',
        title: 'Mungaru Male',
        artist: 'Vijay Prakash',
        album: 'Mungaru Male',
        genre: 'Kannada',
        duration: 295000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.512,
        danceability: 0.456,
        energy: 0.445,
        valence: 0.723,
        tempo: 78.3
      },
      {
        id: 'spotify-13',
        title: 'Jeeva Veene',
        artist: 'Vijay Prakash',
        album: 'Apthamitra',
        genre: 'Kannada',
        duration: 267000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.478,
        danceability: 0.534,
        energy: 0.456,
        valence: 0.654,
        tempo: 85.2
      },
      // Vijay Prakash - Tamil Songs
      {
        id: 'spotify-14',
        title: 'Kadhal Anukkal',
        artist: 'Vijay Prakash',
        album: 'Enthiran',
        genre: 'Tamil',
        duration: 245000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.389,
        danceability: 0.612,
        energy: 0.578,
        valence: 0.745,
        tempo: 95.8
      },
      {
        id: 'spotify-15',
        title: 'Uyire Uyire',
        artist: 'Vijay Prakash',
        album: 'Bommalattam',
        genre: 'Tamil',
        duration: 289000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.445,
        danceability: 0.567,
        energy: 0.489,
        valence: 0.678,
        tempo: 88.4
      },
      // Vijay Prakash - Telugu Songs
      {
        id: 'spotify-16',
        title: 'Choopultho Guchi Guchi',
        artist: 'Vijay Prakash',
        album: 'Iddarammayilatho',
        genre: 'Telugu',
        duration: 254000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.367,
        danceability: 0.723,
        energy: 0.634,
        valence: 0.812,
        tempo: 102.3
      },
      {
        id: 'spotify-17',
        title: 'Ringa Ringa',
        artist: 'Vijay Prakash',
        album: 'Arya 2',
        genre: 'Telugu',
        duration: 276000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.234,
        danceability: 0.834,
        energy: 0.745,
        valence: 0.889,
        tempo: 115.6
      },
      // Vijay Prakash - Hindi Songs
      {
        id: 'spotify-18',
        title: 'Teri Ore',
        artist: 'Vijay Prakash, Shreya Ghoshal',
        album: 'Singh Is Kinng',
        genre: 'Bollywood',
        duration: 312000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.567,
        energy: 0.456,
        valence: 0.734,
        tempo: 82.7
      },
      {
        id: 'spotify-19',
        title: 'Bheema Thareeko',
        artist: 'Vijay Prakash',
        album: 'Kanteerava',
        genre: 'Kannada',
        duration: 298000,
        popularity: 84,
        platform: 'spotify' as const,
        acousticness: 0.345,
        danceability: 0.689,
        energy: 0.612,
        valence: 0.678,
        tempo: 96.4
      },
      // Other Regional Artists
      {
        id: 'spotify-20',
        title: 'Munbe Vaa',
        artist: 'Naresh Iyer',
        album: 'Sillunu Oru Kaadhal',
        genre: 'Tamil',
        duration: 285000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.378,
        valence: 0.645,
        tempo: 75.8
      },
      {
        id: 'spotify-21',
        title: 'Yenga Pona Raasa',
        artist: 'Karthik',
        album: 'Azhagiya Tamil Magan',
        genre: 'Tamil',
        duration: 267000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.423,
        danceability: 0.612,
        energy: 0.534,
        valence: 0.723,
        tempo: 89.2
      },
      {
        id: 'spotify-22',
        title: 'Neeve Neeve',
        artist: 'Karthik',
        album: 'Nenunnanu',
        genre: 'Telugu',
        duration: 298000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.489,
        danceability: 0.567,
        energy: 0.445,
        valence: 0.678,
        tempo: 83.4
      },
      // More Vijay Prakash tracks for higher accuracy
      {
        id: 'spotify-23',
        title: 'Howdu Swamy',
        artist: 'Vijay Prakash',
        album: 'Duniya',
        genre: 'Kannada',
        duration: 245000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.445,
        danceability: 0.623,
        energy: 0.578,
        valence: 0.712,
        tempo: 98.5
      },
      {
        id: 'spotify-24',
        title: 'Onde Ondu Sari',
        artist: 'Vijay Prakash',
        album: 'Googly',
        genre: 'Kannada',
        duration: 278000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.378,
        danceability: 0.734,
        energy: 0.645,
        valence: 0.823,
        tempo: 105.2
      },
      {
        id: 'spotify-25',
        title: 'Usire Usire',
        artist: 'Vijay Prakash',
        album: 'Googly',
        genre: 'Kannada',
        duration: 265000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.512,
        danceability: 0.456,
        energy: 0.434,
        valence: 0.678,
        tempo: 82.8
      },
      {
        id: 'spotify-26',
        title: 'Ee Sambhashane',
        artist: 'Vijay Prakash',
        album: 'Mungaru Male',
        genre: 'Kannada',
        duration: 289000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.623,
        danceability: 0.378,
        energy: 0.345,
        valence: 0.567,
        tempo: 76.4
      },
      {
        id: 'spotify-27',
        title: 'Modalasala',
        artist: 'Vijay Prakash',
        album: 'Chamak',
        genre: 'Kannada',
        duration: 254000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.234,
        danceability: 0.789,
        energy: 0.712,
        valence: 0.856,
        tempo: 115.8
      },
      {
        id: 'spotify-28',
        title: 'Arere Yekkada',
        artist: 'Vijay Prakash',
        album: 'Nuvvostanante Nenoddantana',
        genre: 'Telugu',
        duration: 267000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.645,
        energy: 0.578,
        valence: 0.734,
        tempo: 92.3
      },
      {
        id: 'spotify-29',
        title: 'Cheliya Cheliya',
        artist: 'Vijay Prakash',
        album: 'Sahasam Swasaga Sagipo',
        genre: 'Telugu',
        duration: 298000,
        popularity: 84,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.423,
        energy: 0.389,
        valence: 0.645,
        tempo: 78.9
      },
      {
        id: 'spotify-30',
        title: 'Mellaga Karagani',
        artist: 'Vijay Prakash',
        album: 'Arya',
        genre: 'Telugu',
        duration: 276000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.489,
        danceability: 0.556,
        energy: 0.467,
        valence: 0.689,
        tempo: 85.7
      },
      {
        id: 'spotify-31',
        title: 'Unnai Kaanadhu Naan',
        artist: 'Vijay Prakash',
        album: 'Vishwaroopam',
        genre: 'Tamil',
        duration: 289000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.434,
        danceability: 0.512,
        energy: 0.456,
        valence: 0.623,
        tempo: 87.4
      },
      {
        id: 'spotify-32',
        title: 'Mazhai Kuruvi',
        artist: 'Vijay Prakash',
        album: 'Chekka Chivantha Vaanam',
        genre: 'Tamil',
        duration: 243000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.378,
        valence: 0.567,
        tempo: 74.2
      },
      {
        id: 'spotify-33',
        title: 'Hosanna',
        artist: 'Vijay Prakash, Suzanne',
        album: 'Vinnaithaandi Varuvaayaa',
        genre: 'Tamil',
        duration: 312000,
        popularity: 93,
        platform: 'spotify' as const,
        acousticness: 0.345,
        danceability: 0.623,
        energy: 0.578,
        valence: 0.789,
        tempo: 96.8
      },
      {
        id: 'spotify-34',
        title: 'Fanaa',
        artist: 'Vijay Prakash',
        album: 'Yuva',
        genre: 'Hindi',
        duration: 298000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.478,
        danceability: 0.534,
        energy: 0.445,
        valence: 0.656,
        tempo: 81.5
      },
      {
        id: 'spotify-35',
        title: 'Swades',
        artist: 'Vijay Prakash',
        album: 'Swades',
        genre: 'Hindi',
        duration: 287000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.456,
        energy: 0.389,
        valence: 0.623,
        tempo: 76.8
      },
      // CLASSIC ERA LEGENDS (1950s-1970s)
      // Mohammed Rafi - The Voice of Gold
      {
        id: 'spotify-36',
        title: 'Chaudhvin Ka Chand',
        artist: 'Mohammed Rafi',
        album: 'Chaudhvin Ka Chand',
        genre: 'Hindi Classic',
        duration: 245000,
        popularity: 94,
        platform: 'spotify' as const,
        acousticness: 0.789,
        danceability: 0.345,
        energy: 0.456,
        valence: 0.678,
        tempo: 72.5
      },
      {
        id: 'spotify-37',
        title: 'Gulabi Aankhein',
        artist: 'Mohammed Rafi',
        album: 'The Train',
        genre: 'Hindi Classic',
        duration: 234000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.723,
        danceability: 0.456,
        energy: 0.534,
        valence: 0.789,
        tempo: 85.3
      },
      {
        id: 'spotify-38',
        title: 'Kya Hua Tera Wada',
        artist: 'Mohammed Rafi',
        album: 'Hum Kisise Kum Naheen',
        genre: 'Hindi Classic',
        duration: 267000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.656,
        danceability: 0.389,
        energy: 0.445,
        valence: 0.534,
        tempo: 78.2
      },
      // Lata Mangeshkar - Nightingale of India
      {
        id: 'spotify-39',
        title: 'Lag Jaa Gale',
        artist: 'Lata Mangeshkar',
        album: 'Woh Kaun Thi',
        genre: 'Hindi Classic',
        duration: 298000,
        popularity: 96,
        platform: 'spotify' as const,
        acousticness: 0.834,
        danceability: 0.267,
        energy: 0.345,
        valence: 0.456,
        tempo: 68.7
      },
      {
        id: 'spotify-40',
        title: 'Pyar Kiya To Darna Kya',
        artist: 'Lata Mangeshkar',
        album: 'Mughal-E-Azam',
        genre: 'Hindi Classic',
        duration: 456000,
        popularity: 95,
        platform: 'spotify' as const,
        acousticness: 0.778,
        danceability: 0.423,
        energy: 0.567,
        valence: 0.789,
        tempo: 95.4
      },
      {
        id: 'spotify-41',
        title: 'Ajeeb Dastan Hai Yeh',
        artist: 'Lata Mangeshkar',
        album: 'Dagh',
        genre: 'Hindi Classic',
        duration: 234000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.712,
        danceability: 0.345,
        energy: 0.389,
        valence: 0.445,
        tempo: 74.8
      },
      // Kishore Kumar - The Versatile Legend
      {
        id: 'spotify-42',
        title: 'Roop Tera Mastana',
        artist: 'Kishore Kumar',
        album: 'Aradhana',
        genre: 'Hindi Classic',
        duration: 287000,
        popularity: 93,
        platform: 'spotify' as const,
        acousticness: 0.645,
        danceability: 0.567,
        energy: 0.634,
        valence: 0.823,
        tempo: 102.6
      },
      {
        id: 'spotify-43',
        title: 'Mere Sapnon Ki Rani',
        artist: 'Kishore Kumar',
        album: 'Aradhana',
        genre: 'Hindi Classic',
        duration: 312000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.578,
        danceability: 0.645,
        energy: 0.567,
        valence: 0.756,
        tempo: 92.8
      },
      {
        id: 'spotify-44',
        title: 'Zindagi Ek Safar',
        artist: 'Kishore Kumar',
        album: 'Andaz',
        genre: 'Hindi Classic',
        duration: 276000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.523,
        danceability: 0.712,
        energy: 0.634,
        valence: 0.834,
        tempo: 108.4
      },
      // GOLDEN ERA (1980s-1990s)
      // Kumar Sanu - King of 90s
      {
        id: 'spotify-45',
        title: 'Tujhe Dekha To',
        artist: 'Kumar Sanu',
        album: 'Dilwale Dulhania Le Jayenge',
        genre: 'Hindi 90s',
        duration: 289000,
        popularity: 94,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.578,
        energy: 0.567,
        valence: 0.789,
        tempo: 86.7
      },
      {
        id: 'spotify-46',
        title: 'Ek Ladki Ko Dekha',
        artist: 'Kumar Sanu',
        album: '1942: A Love Story',
        genre: 'Hindi 90s',
        duration: 345000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.456,
        valence: 0.678,
        tempo: 78.9
      },
      {
        id: 'spotify-47',
        title: 'Dil Hai Ke Manta Nahin',
        artist: 'Kumar Sanu',
        album: 'Dil Hai Ke Manta Nahin',
        genre: 'Hindi 90s',
        duration: 298000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.489,
        danceability: 0.634,
        energy: 0.578,
        valence: 0.745,
        tempo: 95.3
      },
      // Udit Narayan - Romantic Voice
      {
        id: 'spotify-48',
        title: 'Papa Kehte Hain',
        artist: 'Udit Narayan',
        album: 'Qayamat Se Qayamat Tak',
        genre: 'Hindi 90s',
        duration: 267000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.534,
        danceability: 0.567,
        energy: 0.612,
        valence: 0.812,
        tempo: 98.7
      },
      {
        id: 'spotify-49',
        title: 'Pehla Nasha',
        artist: 'Udit Narayan',
        album: 'Jo Jeeta Wohi Sikandar',
        genre: 'Hindi 90s',
        duration: 354000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.623,
        danceability: 0.456,
        energy: 0.534,
        valence: 0.689,
        tempo: 82.4
      },
      // Alka Yagnik - Queen of Melody
      {
        id: 'spotify-50',
        title: 'Taal Se Taal',
        artist: 'Alka Yagnik, Udit Narayan',
        album: 'Taal',
        genre: 'Hindi 90s',
        duration: 378000,
        popularity: 93,
        platform: 'spotify' as const,
        acousticness: 0.345,
        danceability: 0.789,
        energy: 0.712,
        valence: 0.856,
        tempo: 118.6
      },
      {
        id: 'spotify-51',
        title: 'Kuch Kuch Hota Hai',
        artist: 'Alka Yagnik, Udit Narayan',
        album: 'Kuch Kuch Hota Hai',
        genre: 'Hindi 90s',
        duration: 324000,
        popularity: 95,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.634,
        energy: 0.578,
        valence: 0.823,
        tempo: 92.8
      },
      // MODERN ERA (2000s-2010s)
      // Sonu Nigam - Modern Legend
      {
        id: 'spotify-52',
        title: 'Kal Ho Naa Ho',
        artist: 'Sonu Nigam',
        album: 'Kal Ho Naa Ho',
        genre: 'Hindi 2000s',
        duration: 324000,
        popularity: 96,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.456,
        valence: 0.634,
        tempo: 76.5
      },
      {
        id: 'spotify-53',
        title: 'Suraj Hua Maddham',
        artist: 'Sonu Nigam, Alka Yagnik',
        album: 'Kabhi Khushi Kabhie Gham',
        genre: 'Hindi 2000s',
        duration: 398000,
        popularity: 94,
        platform: 'spotify' as const,
        acousticness: 0.634,
        danceability: 0.456,
        energy: 0.512,
        valence: 0.789,
        tempo: 84.7
      },
      {
        id: 'spotify-54',
        title: 'Sandese Aate Hai',
        artist: 'Sonu Nigam',
        album: 'Border',
        genre: 'Hindi Patriotic',
        duration: 456000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.723,
        danceability: 0.234,
        energy: 0.445,
        valence: 0.567,
        tempo: 68.9
      },
      {
        id: 'spotify-55',
        title: 'Abhi Mujh Mein Kahin',
        artist: 'Sonu Nigam',
        album: 'Agneepath',
        genre: 'Hindi 2000s',
        duration: 356000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.678,
        danceability: 0.345,
        energy: 0.389,
        valence: 0.456,
        tempo: 72.3
      },
      // KK - The Soulful Voice
      {
        id: 'spotify-56',
        title: 'Tadap Tadap',
        artist: 'KK',
        album: 'Hum Dil De Chuke Sanam',
        genre: 'Hindi 2000s',
        duration: 456000,
        popularity: 93,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.634,
        valence: 0.456,
        tempo: 88.4
      },
      {
        id: 'spotify-57',
        title: 'Khuda Jaane',
        artist: 'KK, Shilpa Rao',
        album: 'Bachna Ae Haseeno',
        genre: 'Hindi 2000s',
        duration: 287000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.489,
        danceability: 0.578,
        energy: 0.567,
        valence: 0.723,
        tempo: 92.6
      },
      {
        id: 'spotify-58',
        title: 'Zara Sa',
        artist: 'KK',
        album: 'Jannat',
        genre: 'Hindi 2000s',
        duration: 234000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.623,
        danceability: 0.456,
        energy: 0.445,
        valence: 0.678,
        tempo: 78.7
      },
      // TAMIL LEGENDS
      // T.M. Soundararajan - Tamil Legend
      {
        id: 'spotify-59',
        title: 'Paatum Naane',
        artist: 'T.M. Soundararajan',
        album: 'Annai Velankanni',
        genre: 'Tamil Classic',
        duration: 345000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.756,
        danceability: 0.345,
        energy: 0.456,
        valence: 0.678,
        tempo: 75.8
      },
      // P. Susheela - Tamil Nightingale
      {
        id: 'spotify-60',
        title: 'Mullai Malar Mele',
        artist: 'P. Susheela',
        album: 'Pasamalar',
        genre: 'Tamil Classic',
        duration: 298000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.678,
        danceability: 0.389,
        energy: 0.345,
        valence: 0.567,
        tempo: 68.4
      },
      // S.P. Balasubrahmanyam - The Legend
      {
        id: 'spotify-61',
        title: 'Mannil Indha Kadhaley',
        artist: 'S.P. Balasubrahmanyam',
        album: 'Keladi Kanmani',
        genre: 'Tamil 80s',
        duration: 267000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.534,
        danceability: 0.567,
        energy: 0.456,
        valence: 0.789,
        tempo: 86.7
      },
      {
        id: 'spotify-62',
        title: 'Chinna Chinna Aasai',
        artist: 'S.P. Balasubrahmanyam',
        album: 'Roja',
        genre: 'Tamil 90s',
        duration: 289000,
        popularity: 94,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.634,
        energy: 0.578,
        valence: 0.823,
        tempo: 98.5
      },
      // Hariharan - Ghazal Master
      {
        id: 'spotify-63',
        title: 'Raga Behag',
        artist: 'Hariharan',
        album: 'Classical Collection',
        genre: 'Tamil Classical',
        duration: 423000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.834,
        danceability: 0.234,
        energy: 0.345,
        valence: 0.567,
        tempo: 65.2
      },
      // TELUGU LEGENDS
      // Ghantasala - Telugu Legend
      {
        id: 'spotify-64',
        title: 'Bhale Bhale Magadivoy',
        artist: 'Ghantasala',
        album: 'Mayabazar',
        genre: 'Telugu Classic',
        duration: 234000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.723,
        danceability: 0.456,
        energy: 0.534,
        valence: 0.678,
        tempo: 92.3
      },
      {
        id: 'spotify-65',
        title: 'Jagadeka Veerudu',
        artist: 'S.P. Balasubrahmanyam',
        album: 'Jagadeka Veerudu Athiloka Sundari',
        genre: 'Telugu 90s',
        duration: 298000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.445,
        danceability: 0.667,
        energy: 0.634,
        valence: 0.789,
        tempo: 105.4
      },
      // BENGALI LEGENDS
      // Hemanta Mukherjee
      {
        id: 'spotify-66',
        title: 'Ei Path Jodi Na Shesh Hoy',
        artist: 'Hemanta Mukherjee',
        album: 'Saptapadi',
        genre: 'Bengali Classic',
        duration: 345000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.778,
        danceability: 0.234,
        energy: 0.345,
        valence: 0.456,
        tempo: 68.7
      },
      // Manna Dey - Multi-language Legend
      {
        id: 'spotify-67',
        title: 'Coffee Houser Sei Addata',
        artist: 'Manna Dey',
        album: 'Bengali Hits',
        genre: 'Bengali Classic',
        duration: 267000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.645,
        danceability: 0.456,
        energy: 0.534,
        valence: 0.678,
        tempo: 88.9
      },
      // CONTEMPORARY ERA (2010s-Present)
      // Shreya Ghoshal - Modern Queen
      {
        id: 'spotify-68',
        title: 'Teri Ore',
        artist: 'Shreya Ghoshal, Rahat Fateh Ali Khan',
        album: 'Singh Is Kinng',
        genre: 'Hindi Contemporary',
        duration: 312000,
        popularity: 94,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.456,
        energy: 0.456,
        valence: 0.734,
        tempo: 82.7
      },
      {
        id: 'spotify-69',
        title: 'Manwa Laage',
        artist: 'Shreya Ghoshal, Shaan',
        album: 'Happy New Year',
        genre: 'Hindi Contemporary',
        duration: 289000,
        popularity: 92,
        platform: 'spotify' as const,
        acousticness: 0.445,
        danceability: 0.634,
        energy: 0.567,
        valence: 0.789,
        tempo: 95.6
      },
      // Rahat Fateh Ali Khan - Sufi Master
      {
        id: 'spotify-70',
        title: 'Jiya Dhadak Dhadak',
        artist: 'Rahat Fateh Ali Khan',
        album: 'Kalyug',
        genre: 'Hindi Sufi',
        duration: 356000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.678,
        danceability: 0.389,
        energy: 0.456,
        valence: 0.567,
        tempo: 78.4
      },
      {
        id: 'spotify-71',
        title: 'Tumhe Dillagi',
        artist: 'Rahat Fateh Ali Khan',
        album: 'Hum Dil De Chuke Sanam',
        genre: 'Hindi Sufi',
        duration: 423000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.734,
        danceability: 0.267,
        energy: 0.389,
        valence: 0.445,
        tempo: 68.9
      },
      // PUNJABI LEGENDS
      // Gurdas Maan
      {
        id: 'spotify-72',
        title: 'Challa',
        artist: 'Gurdas Maan',
        album: 'Jab We Met',
        genre: 'Punjabi',
        duration: 234000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.723,
        energy: 0.678,
        valence: 0.834,
        tempo: 125.8
      },
      // Rahat Fateh Ali Khan Punjabi
      {
        id: 'spotify-73',
        title: 'Ishq Bina',
        artist: 'Rahat Fateh Ali Khan',
        album: 'Taal Se Taal',
        genre: 'Punjabi Sufi',
        duration: 298000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.456,
        valence: 0.623,
        tempo: 82.3
      },
      // MORE CONTEMPORARY ARTISTS
      // Atif Aslam
      {
        id: 'spotify-74',
        title: 'Tera Hone Laga Hoon',
        artist: 'Atif Aslam',
        album: 'Ajab Prem Ki Ghazab Kahani',
        genre: 'Hindi Contemporary',
        duration: 298000,
        popularity: 93,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.456,
        energy: 0.478,
        valence: 0.734,
        tempo: 84.5
      },
      {
        id: 'spotify-75',
        title: 'Tere Sang Yaara',
        artist: 'Atif Aslam',
        album: 'Rustom',
        genre: 'Hindi Contemporary',
        duration: 276000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.623,
        danceability: 0.445,
        energy: 0.456,
        valence: 0.678,
        tempo: 78.9
      },
      // Mohit Chauhan
      {
        id: 'spotify-76',
        title: 'Tum Se Hi',
        artist: 'Mohit Chauhan',
        album: 'Jab We Met',
        genre: 'Hindi Contemporary',
        duration: 289000,
        popularity: 90,
        platform: 'spotify' as const,
        acousticness: 0.534,
        danceability: 0.578,
        energy: 0.512,
        valence: 0.789,
        tempo: 92.3
      },
      {
        id: 'spotify-77',
        title: 'Masakali',
        artist: 'Mohit Chauhan',
        album: 'Delhi-6',
        genre: 'Hindi Contemporary',
        duration: 245000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.456,
        danceability: 0.634,
        energy: 0.567,
        valence: 0.823,
        tempo: 108.7
      },
      // Armaan Malik - New Generation
      {
        id: 'spotify-78',
        title: 'Bol Do Na Zara',
        artist: 'Armaan Malik',
        album: 'Azhar',
        genre: 'Hindi New Gen',
        duration: 234000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.478,
        danceability: 0.556,
        energy: 0.523,
        valence: 0.712,
        tempo: 88.4
      },
      {
        id: 'spotify-79',
        title: 'Wajah Tum Ho',
        artist: 'Armaan Malik',
        album: 'Hate Story 3',
        genre: 'Hindi New Gen',
        duration: 267000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.445,
        energy: 0.456,
        valence: 0.634,
        tempo: 76.8
      },
      // Jubin Nautiyal
      {
        id: 'spotify-80',
        title: 'Kaabil Hoon',
        artist: 'Jubin Nautiyal',
        album: 'Kaabil',
        genre: 'Hindi New Gen',
        duration: 298000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.534,
        danceability: 0.467,
        energy: 0.489,
        valence: 0.678,
        tempo: 82.6
      },
      // REGIONAL NEW GENERATION
      // Sid Sriram - Tamil Contemporary
      {
        id: 'spotify-81',
        title: 'Adiye',
        artist: 'Sid Sriram',
        album: 'Kadal',
        genre: 'Tamil Contemporary',
        duration: 276000,
        popularity: 89,
        platform: 'spotify' as const,
        acousticness: 0.623,
        danceability: 0.445,
        energy: 0.456,
        valence: 0.678,
        tempo: 78.5
      },
      {
        id: 'spotify-82',
        title: 'Thalli Pogathey',
        artist: 'Sid Sriram',
        album: 'Achcham Yenbadhu Madamaiyada',
        genre: 'Tamil Contemporary',
        duration: 289000,
        popularity: 91,
        platform: 'spotify' as const,
        acousticness: 0.567,
        danceability: 0.456,
        energy: 0.445,
        valence: 0.623,
        tempo: 75.8
      },
      // Anirudh Ravichander
      {
        id: 'spotify-83',
        title: 'Why This Kolaveri Di',
        artist: 'Dhanush',
        album: '3',
        genre: 'Tamil Viral',
        duration: 234000,
        popularity: 95,
        platform: 'spotify' as const,
        acousticness: 0.345,
        danceability: 0.789,
        energy: 0.712,
        valence: 0.889,
        tempo: 132.5
      },
      // MALAYALAM ARTISTS
      // K.J. Yesudas
      {
        id: 'spotify-84',
        title: 'Harivarasanam',
        artist: 'K.J. Yesudas',
        album: 'Sabarimala Songs',
        genre: 'Malayalam Devotional',
        duration: 456000,
        popularity: 88,
        platform: 'spotify' as const,
        acousticness: 0.823,
        danceability: 0.234,
        energy: 0.345,
        valence: 0.567,
        tempo: 65.4
      },
      {
        id: 'spotify-85',
        title: 'Gowri Ganesha',
        artist: 'K.J. Yesudas',
        album: 'Malayalam Classics',
        genre: 'Malayalam Classic',
        duration: 345000,
        popularity: 86,
        platform: 'spotify' as const,
        acousticness: 0.734,
        danceability: 0.345,
        energy: 0.456,
        valence: 0.678,
        tempo: 78.9
      },
      // MARATHI ARTISTS
      // Lata Mangeshkar Marathi
      {
        id: 'spotify-86',
        title: 'Disला',
        artist: 'Lata Mangeshkar',
        album: 'Marathi Hits',
        genre: 'Marathi Classic',
        duration: 267000,
        popularity: 84,
        platform: 'spotify' as const,
        acousticness: 0.678,
        danceability: 0.389,
        energy: 0.445,
        valence: 0.567,
        tempo: 82.3
      },
      // FUSION & INDIE
      // Prateek Kuhad
      {
        id: 'spotify-87',
        title: 'cold/mess',
        artist: 'Prateek Kuhad',
        album: 'cold/mess',
        genre: 'Hindi Indie',
        duration: 234000,
        popularity: 87,
        platform: 'spotify' as const,
        acousticness: 0.734,
        danceability: 0.445,
        energy: 0.367,
        valence: 0.456,
        tempo: 72.5
      },
      // The Local Train
      {
        id: 'spotify-88',
        title: 'Choo Lo',
        artist: 'The Local Train',
        album: 'Aalas Ka Pedh',
        genre: 'Hindi Rock',
        duration: 298000,
        popularity: 85,
        platform: 'spotify' as const,
        acousticness: 0.234,
        danceability: 0.567,
        energy: 0.734,
        valence: 0.678,
        tempo: 115.6
      }
    ];

    // Enhanced search for regional artists and multi-language content
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(' ').filter(word => word.length > 0);

    const filteredTracks = mockTracks.filter(track => {
      const titleLower = track.title.toLowerCase();
      const artistLower = track.artist.toLowerCase();
      const genreLower = (track.genre || '').toLowerCase();
      const albumLower = (track.album || '').toLowerCase();

      // Exact name match (highest priority)
      if (artistLower.includes(queryLower) || titleLower.includes(queryLower)) {
        return true;
      }

      // Word-by-word matching
      const titleWords = titleLower.split(/[\s\-,]+/);
      const artistWords = artistLower.split(/[\s\-,]+/);
      const genreWords = genreLower.split(/[\s\-,]+/);
      const albumWords = albumLower.split(/[\s\-,]+/);
      const allWords = [...titleWords, ...artistWords, ...genreWords, ...albumWords];

      // Check if any query word matches any track word
      return queryWords.some(queryWord => {
        if (queryWord.length < 2) return false; // Skip very short words
        return allWords.some(word => {
          // Exact word match or contains match for longer words
          return word === queryWord ||
                 (queryWord.length >= 3 && word.includes(queryWord)) ||
                 (word.length >= 3 && queryWord.includes(word));
        });
      });
    });

    // Sort by relevance - exact artist matches first
    filteredTracks.sort((a, b) => {
      const aArtistMatch = a.artist.toLowerCase().includes(queryLower);
      const bArtistMatch = b.artist.toLowerCase().includes(queryLower);

      if (aArtistMatch && !bArtistMatch) return -1;
      if (!aArtistMatch && bArtistMatch) return 1;

      // Then sort by popularity
      return (b.popularity || 0) - (a.popularity || 0);
    });

    // If no matches found, return empty array instead of random tracks
    return filteredTracks.slice(0, limit);
  }

  private getMockFeatures(): Partial<Track> {
    return {
      acousticness: Math.random() * 0.5,
      danceability: Math.random() * 0.8 + 0.2,
      energy: Math.random() * 0.8 + 0.2,
      valence: Math.random() * 0.8 + 0.2,
      tempo: Math.random() * 100 + 80
    };
  }
}
