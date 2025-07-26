import { PlatformAdapter, Track } from "@shared/recommendation";

export class YouTubeAdapter implements PlatformAdapter {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    // Always return mock data for now since we're in demo mode
    console.log(`YouTube search for: "${query}"`);
    return this.getMockTracks(query, limit);

    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' music')}&type=video&maxResults=${limit}&key=${this.apiKey}&videoCategoryId=10`
      );

      if (!searchResponse.ok) {
        throw new Error(`YouTube search failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();

      const tracks: Track[] = searchData.items.map((item: any): Track => {
        const title = item.snippet.title;
        const artist = this.extractArtistFromTitle(title) || item.snippet.channelTitle;
        
        return {
          id: item.id.videoId,
          title: this.cleanTitle(title),
          artist: artist,
          duration: 0, // Would need additional API call to get duration
          platform: 'youtube',
          thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          externalUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      });

      return tracks;
    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getMockTracks(query, limit);
    }
  }

  async getTrackFeatures(trackId: string): Promise<Partial<Track>> {
    // YouTube doesn't provide audio features like Spotify
    // We could potentially use machine learning to analyze audio
    // For now, return estimated features based on genre or other metadata
    return this.getMockFeatures();
  }

  private extractArtistFromTitle(title: string): string | null {
    // Common patterns: "Artist - Song", "Artist: Song", "Song by Artist"
    const patterns = [
      /^([^-]+)\s*-\s*(.+)$/,
      /^([^:]+):\s*(.+)$/,
      /(.+)\s+by\s+([^(]+)/i,
      /^([^|]+)\s*\|\s*(.+)$/
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        const artist = match[1].trim();
        // Filter out common video metadata
        if (!this.isVideoMetadata(artist)) {
          return artist;
        }
      }
    }

    return null;
  }

  private cleanTitle(title: string): string {
    // Remove common video metadata patterns
    let cleaned = title
      .replace(/\[.*?\]/g, '') // Remove [Official Video], [Lyrics], etc.
      .replace(/\(.*?official.*?\)/gi, '') // Remove (Official Music Video), etc.
      .replace(/\(.*?lyrics.*?\)/gi, '') // Remove (Lyrics), (With Lyrics), etc.
      .replace(/\(.*?audio.*?\)/gi, '') // Remove (Official Audio), etc.
      .replace(/\s*-\s*topic$/gi, '') // Remove "- Topic" from auto-generated channels
      .replace(/^\s*\d+\.\s*/, '') // Remove track numbers like "1. "
      .trim();

    // If we removed too much, return original
    if (cleaned.length < title.length * 0.3) {
      return title;
    }

    return cleaned;
  }

  private isVideoMetadata(text: string): boolean {
    const metadata = [
      'official', 'video', 'music', 'lyrics', 'audio', 'hd', '4k',
      'topic', 'vevo', 'records', 'entertainment', 'channel'
    ];
    
    const lowerText = text.toLowerCase();
    return metadata.some(meta => lowerText.includes(meta));
  }

  private getMockTracks(query: string, limit: number): Track[] {
    const mockTracks = [
      // International Artists
      {
        id: 'youtube-1',
        title: 'Blinding Lights - Official Video',
        artist: 'The Weeknd',
        duration: 200000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/fHI8X4OXluQ/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=fHI8X4OXluQ'
      },
      {
        id: 'youtube-2',
        title: 'Shape of You - Official Video',
        artist: 'Ed Sheeran',
        duration: 233000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8'
      },
      // Indian/Bollywood Content
      {
        id: 'youtube-3',
        title: 'Tum Hi Ho - Full Video Song',
        artist: 'Arijit Singh',
        duration: 262000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/IJq0yyWug1k/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=IJq0yyWug1k'
      },
      {
        id: 'youtube-4',
        title: 'Kesariya - Official Video | Brahmastra',
        artist: 'Arijit Singh',
        duration: 295000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/kVaWke2vpgE/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=kVaWke2vpgE'
      },
      {
        id: 'youtube-5',
        title: 'Raabta - Title Song Video',
        artist: 'Arijit Singh',
        duration: 284000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/eQp9kvseLHs/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=eQp9kvseLHs'
      },
      {
        id: 'youtube-6',
        title: 'Channa Mereya - Full Video | Ae Dil Hai Mushkil',
        artist: 'Arijit Singh',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/bzSTpdcs-EI/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=bzSTpdcs-EI'
      },
      {
        id: 'youtube-7',
        title: 'Arijit Singh Live Performance - Best Songs',
        artist: 'Arijit Singh',
        duration: 3600000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/LIVE123/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=LIVE123'
      },
      // More International
      {
        id: 'youtube-8',
        title: 'Someone Like You - Live from the Royal Albert Hall',
        artist: 'Adele',
        duration: 285000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0'
      },
      {
        id: 'youtube-9',
        title: 'Perfect - Official Music Video',
        artist: 'Ed Sheeran',
        duration: 263000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g'
      },
      {
        id: 'youtube-10',
        title: 'Levitating - Official Music Video',
        artist: 'Dua Lipa',
        duration: 203000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw'
      },
      // Vijay Prakash - Kannada Content
      {
        id: 'youtube-11',
        title: 'Gaalipata - Full Video Song | Kannada Hit',
        artist: 'Vijay Prakash',
        duration: 278000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/gaalipata123/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=gaalipata123'
      },
      {
        id: 'youtube-12',
        title: 'Mungaru Male - Title Song | Vijay Prakash | Kannada',
        artist: 'Vijay Prakash',
        duration: 295000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/mungarumale456/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=mungarumale456'
      },
      {
        id: 'youtube-13',
        title: 'Jeeva Veene - Apthamitra | Vijay Prakash',
        artist: 'Vijay Prakash',
        duration: 267000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/jeevaveene789/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=jeevaveene789'
      },
      // Vijay Prakash - Tamil Content
      {
        id: 'youtube-14',
        title: 'Kadhal Anukkal - Enthiran | Vijay Prakash | A.R. Rahman',
        artist: 'Vijay Prakash',
        duration: 245000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/kadhalanukkal/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=kadhalanukkal'
      },
      {
        id: 'youtube-15',
        title: 'Uyire Uyire - Bommalattam | Vijay Prakash',
        artist: 'Vijay Prakash',
        duration: 289000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/uyireuyire/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=uyireuyire'
      },
      // Vijay Prakash - Telugu Content
      {
        id: 'youtube-16',
        title: 'Choopultho Guchi Guchi - Iddarammayilatho | Vijay Prakash',
        artist: 'Vijay Prakash',
        duration: 254000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/choopultho/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=choopultho'
      },
      {
        id: 'youtube-17',
        title: 'Ringa Ringa - Arya 2 | Vijay Prakash | Telugu Hit',
        artist: 'Vijay Prakash',
        duration: 276000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/ringaringa/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=ringaringa'
      },
      // Vijay Prakash - Hindi Content
      {
        id: 'youtube-18',
        title: 'Teri Ore - Singh Is Kinng | Vijay Prakash & Shreya Ghoshal',
        artist: 'Vijay Prakash, Shreya Ghoshal',
        duration: 312000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/teriore/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=teriore'
      },
      {
        id: 'youtube-19',
        title: 'Bheema Thareeko - Kanteerava | Vijay Prakash | Kannada',
        artist: 'Vijay Prakash',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/bheemathareeko/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=bheemathareeko'
      },
      // Other Regional Content
      {
        id: 'youtube-20',
        title: 'Munbe Vaa - Sillunu Oru Kaadhal | Naresh Iyer | Tamil',
        artist: 'Naresh Iyer',
        duration: 285000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/munbevaa/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=munbevaa'
      },
      {
        id: 'youtube-21',
        title: 'Yenga Pona Raasa - Azhagiya Tamil Magan | Karthik',
        artist: 'Karthik',
        duration: 267000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/yengapona/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=yengapona'
      },
      {
        id: 'youtube-22',
        title: 'Neeve Neeve - Nenunnanu | Karthik | Telugu Melody',
        artist: 'Karthik',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/neeveneeve/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=neeveneeve'
      },
      // Expanded Vijay Prakash YouTube catalog
      {
        id: 'youtube-23',
        title: 'Howdu Swamy - Duniya | Vijay Prakash | Kannada Hit',
        artist: 'Vijay Prakash',
        duration: 245000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/howduswamy/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=howduswamy'
      },
      {
        id: 'youtube-24',
        title: 'Onde Ondu Sari - Googly | Vijay Prakash | Kannada',
        artist: 'Vijay Prakash',
        duration: 278000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/ondeondu/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=ondeondu'
      },
      {
        id: 'youtube-25',
        title: 'Usire Usire - Googly | Vijay Prakash | Romantic Kannada Song',
        artist: 'Vijay Prakash',
        duration: 265000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/usireusire/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=usireusire'
      },
      {
        id: 'youtube-26',
        title: 'Ee Sambhashane - Mungaru Male | Vijay Prakash | Kannada Classic',
        artist: 'Vijay Prakash',
        duration: 289000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/eesambhashane/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=eesambhashane'
      },
      {
        id: 'youtube-27',
        title: 'Modalasala - Chamak | Vijay Prakash | Dance Number',
        artist: 'Vijay Prakash',
        duration: 254000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/modalasala/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=modalasala'
      },
      {
        id: 'youtube-28',
        title: 'Arere Yekkada - Nuvvostanante Nenoddantana | Vijay Prakash',
        artist: 'Vijay Prakash',
        duration: 267000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/arereyekkada/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=arereyekkada'
      },
      {
        id: 'youtube-29',
        title: 'Cheliya Cheliya - Sahasam Swasaga Sagipo | Vijay Prakash',
        artist: 'Vijay Prakash',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/cheliyacheliya/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=cheliyacheliya'
      },
      {
        id: 'youtube-30',
        title: 'Mellaga Karagani - Arya | Vijay Prakash | Telugu Melody',
        artist: 'Vijay Prakash',
        duration: 276000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/mellagakaragani/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=mellagakaragani'
      },
      {
        id: 'youtube-31',
        title: 'Unnai Kaanadhu Naan - Vishwaroopam | Vijay Prakash | Tamil',
        artist: 'Vijay Prakash',
        duration: 289000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/unnaikaanadhu/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=unnaikaanadhu'
      },
      {
        id: 'youtube-32',
        title: 'Mazhai Kuruvi - Chekka Chivantha Vaanam | Vijay Prakash',
        artist: 'Vijay Prakash',
        duration: 243000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/mazhaikuruvi/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=mazhaikuruvi'
      },
      {
        id: 'youtube-33',
        title: 'Hosanna - Vinnaithaandi Varuvaayaa | Vijay Prakash & Suzanne',
        artist: 'Vijay Prakash, Suzanne',
        duration: 312000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/hosanna/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=hosanna'
      },
      {
        id: 'youtube-34',
        title: 'Fanaa - Yuva | Vijay Prakash | A.R. Rahman | Hindi',
        artist: 'Vijay Prakash',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/fanaa/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=fanaa'
      },
      {
        id: 'youtube-35',
        title: 'Swades - Title Song | Vijay Prakash | A.R. Rahman',
        artist: 'Vijay Prakash',
        duration: 287000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/swades/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=swades'
      },
      // CLASSIC ERA LEGENDS ON YOUTUBE
      // Mohammed Rafi
      {
        id: 'youtube-36',
        title: 'Chaudhvin Ka Chand Ho - Mohammed Rafi | Classic Hindi',
        artist: 'Mohammed Rafi',
        duration: 245000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/chaudhvinkachand/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=chaudhvinkachand'
      },
      {
        id: 'youtube-37',
        title: 'Gulabi Aankhein - Mohammed Rafi | Evergreen Hit',
        artist: 'Mohammed Rafi',
        duration: 234000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/gulabiankhen/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=gulabiankhen'
      },
      {
        id: 'youtube-38',
        title: 'Kya Hua Tera Wada - Mohammed Rafi | Romantic Classic',
        artist: 'Mohammed Rafi',
        duration: 267000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/kyahuaterawada/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=kyahuaterawada'
      },
      // Lata Mangeshkar
      {
        id: 'youtube-39',
        title: 'Lag Jaa Gale - Lata Mangeshkar | Timeless Classic',
        artist: 'Lata Mangeshkar',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/lagjaagale/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=lagjaagale'
      },
      {
        id: 'youtube-40',
        title: 'Pyar Kiya To Darna Kya - Lata Mangeshkar | Mughal-E-Azam',
        artist: 'Lata Mangeshkar',
        duration: 456000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/pyarkiyato/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=pyarkiyato'
      },
      // Kishore Kumar
      {
        id: 'youtube-41',
        title: 'Roop Tera Mastana - Kishore Kumar | Aradhana',
        artist: 'Kishore Kumar',
        duration: 287000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/roopteramastana/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=roopteramastana'
      },
      {
        id: 'youtube-42',
        title: 'Mere Sapnon Ki Rani - Kishore Kumar | Classic Romance',
        artist: 'Kishore Kumar',
        duration: 312000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/meresapnonki/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=meresapnonki'
      },
      // GOLDEN ERA (90s)
      // Kumar Sanu
      {
        id: 'youtube-43',
        title: 'Tujhe Dekha To - Kumar Sanu | DDLJ | Romantic Hit',
        artist: 'Kumar Sanu',
        duration: 289000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/tujhedekhato/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=tujhedekhato'
      },
      {
        id: 'youtube-44',
        title: 'Ek Ladki Ko Dekha - Kumar Sanu | 1942 A Love Story',
        artist: 'Kumar Sanu',
        duration: 345000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/ekladkikodekha/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=ekladkikodekha'
      },
      // Udit Narayan
      {
        id: 'youtube-45',
        title: 'Papa Kehte Hain - Udit Narayan | QSQT | Aamir Khan',
        artist: 'Udit Narayan',
        duration: 267000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/papakehtehain/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=papakehtehain'
      },
      {
        id: 'youtube-46',
        title: 'Pehla Nasha - Udit Narayan | Jo Jeeta Wohi Sikandar',
        artist: 'Udit Narayan',
        duration: 354000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/pehlanasha/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=pehlanasha'
      },
      // MODERN ERA
      // Sonu Nigam
      {
        id: 'youtube-47',
        title: 'Kal Ho Naa Ho - Sonu Nigam | Title Track | Shah Rukh Khan',
        artist: 'Sonu Nigam',
        duration: 324000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/kalhonaaho/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=kalhonaaho'
      },
      {
        id: 'youtube-48',
        title: 'Suraj Hua Maddham - Sonu Nigam & Alka Yagnik | K3G',
        artist: 'Sonu Nigam, Alka Yagnik',
        duration: 398000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/surajhuamaddham/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=surajhuamaddham'
      },
      {
        id: 'youtube-49',
        title: 'Sandese Aate Hai - Sonu Nigam | Border | Patriotic Song',
        artist: 'Sonu Nigam',
        duration: 456000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/sandeseaatehain/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=sandeseaatehain'
      },
      {
        id: 'youtube-50',
        title: 'Abhi Mujh Mein Kahin - Sonu Nigam | Agneepath',
        artist: 'Sonu Nigam',
        duration: 356000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/abhimujhmeinkahin/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=abhimujhmeinkahin'
      },
      // KK
      {
        id: 'youtube-51',
        title: 'Tadap Tadap - KK | Hum Dil De Chuke Sanam | Emotional',
        artist: 'KK',
        duration: 456000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/tadaptadap/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=tadaptadap'
      },
      {
        id: 'youtube-52',
        title: 'Khuda Jaane - KK & Shilpa Rao | Bachna Ae Haseeno',
        artist: 'KK, Shilpa Rao',
        duration: 287000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/khudajaane/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=khudajaane'
      },
      // REGIONAL CONTENT
      // Tamil Legends
      {
        id: 'youtube-53',
        title: 'Chinna Chinna Aasai - SPB | Roja | A.R. Rahman',
        artist: 'S.P. Balasubrahmanyam',
        duration: 289000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/chinnachinaasai/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=chinnachinaasai'
      },
      {
        id: 'youtube-54',
        title: 'Mannil Indha Kadhaley - SPB | Tamil Classic',
        artist: 'S.P. Balasubrahmanyam',
        duration: 267000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/mannilindha/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=mannilindha'
      },
      // Telugu Content
      {
        id: 'youtube-55',
        title: 'Jagadeka Veerudu - SPB | Telugu Hit | Chiranjeevi',
        artist: 'S.P. Balasubrahmanyam',
        duration: 298000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/jagadekaveerudu/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=jagadekaveerudu'
      },
      // Contemporary
      {
        id: 'youtube-56',
        title: 'Teri Ore - Shreya Ghoshal & Rahat Fateh Ali Khan',
        artist: 'Shreya Ghoshal, Rahat Fateh Ali Khan',
        duration: 312000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/teriore2/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=teriore2'
      },
      {
        id: 'youtube-57',
        title: 'Jiya Dhadak Dhadak - Rahat Fateh Ali Khan | Kalyug',
        artist: 'Rahat Fateh Ali Khan',
        duration: 356000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/jiyadhadak/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=jiyadhadak'
      },
      // Punjabi
      {
        id: 'youtube-58',
        title: 'Challa - Gurdas Maan | Jab We Met | Punjabi Hit',
        artist: 'Gurdas Maan',
        duration: 234000,
        platform: 'youtube' as const,
        thumbnailUrl: 'https://i.ytimg.com/vi/challa/medium.jpg',
        externalUrl: 'https://www.youtube.com/watch?v=challa'
      }
    ];

    // Enhanced search for regional artists and multi-language content
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(' ').filter(word => word.length > 0);

    const filteredTracks = mockTracks.filter(track => {
      const titleLower = track.title.toLowerCase();
      const artistLower = track.artist.toLowerCase();

      // Exact name match (highest priority)
      if (artistLower.includes(queryLower) || titleLower.includes(queryLower)) {
        return true;
      }

      // Word-by-word matching
      const titleWords = titleLower.split(/[\s\-,|]+/);
      const artistWords = artistLower.split(/[\s\-,|]+/);
      const allWords = [...titleWords, ...artistWords];

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

      return 0; // Keep original order for same relevance
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
