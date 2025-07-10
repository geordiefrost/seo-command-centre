import { KeywordData, SERPAnalysis } from '../../types';
import { mockKeywordData, mockSERPAnalysis, mockCompetitorData } from '../../mock/integrations/dataforseo';

class DataForSEOService {
  private useMockData = import.meta.env.VITE_MOCK_MODE === 'true';
  private apiKey = import.meta.env.VITE_DATAFORSEO_API_KEY;
  private baseURL = import.meta.env.VITE_DATAFORSEO_API_URL;
  
  async getKeywordData(keywords: string[]): Promise<KeywordData[]> {
    if (this.useMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockKeywordData.filter(k => 
        keywords.some(keyword => 
          k.keyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
    
    // Future: Real API implementation
    return this.callAPI('/keywords/search', { keywords });
  }
  
  async getSERPAnalysis(keyword: string, location: string = 'Australia'): Promise<SERPAnalysis> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const analysis = mockSERPAnalysis.find(s => 
        s.keyword.toLowerCase().includes(keyword.toLowerCase())
      );
      return analysis || mockSERPAnalysis[0];
    }
    
    return this.callAPI('/serp/analyze', { keyword, location });
  }
  
  async getCompetitorRankings(domain: string, keywords?: string[]): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCompetitorData.rankings.filter(r => 
        !keywords || keywords.some(k => r.keyword.includes(k))
      );
    }
    
    return this.callAPI('/competitors/rankings', { domain, keywords });
  }
  
  async getKeywordDifficulty(keywords: string[]): Promise<any[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return keywords.map(keyword => ({
        keyword,
        difficulty: Math.floor(Math.random() * 100),
        searchVolume: Math.floor(Math.random() * 10000),
        cpc: Math.random() * 10,
      }));
    }
    
    return this.callAPI('/keywords/difficulty', { keywords });
  }
  
  async getBacklinkData(domain: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 900));
      return {
        totalBacklinks: Math.floor(Math.random() * 50000),
        referringDomains: Math.floor(Math.random() * 5000),
        domainRating: Math.floor(Math.random() * 100),
        newBacklinks: Math.floor(Math.random() * 100),
        lostBacklinks: Math.floor(Math.random() * 50),
      };
    }
    
    return this.callAPI('/backlinks/overview', { domain });
  }
  
  private async callAPI(endpoint: string, data: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('DataForSEO API key not configured');
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${this.apiKey}:`)}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || result;
  }
}

export default new DataForSEOService();