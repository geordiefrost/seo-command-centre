import { KeywordData, SERPAnalysis } from '../../types';
import { mockKeywordData, mockSERPAnalysis, mockCompetitorData } from '../../mock/integrations/dataforseo';

class DataForSEOService {
  private useMockData = import.meta.env.VITE_MOCK_MODE === 'true';
  private apiLogin = import.meta.env.VITE_DATAFORSEO_LOGIN;
  private apiPassword = import.meta.env.VITE_DATAFORSEO_PASSWORD;
  private baseURL = import.meta.env.VITE_DATAFORSEO_API_URL;
  
  async getKeywordData(keywords: string[]): Promise<KeywordData[]> {
    if (this.useMockData && !this.hasCredentials()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockKeywordData.filter(k => 
        keywords.some(keyword => 
          k.keyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
    
    try {
      // Real API implementation
      const response = await this.callAPI('/keywords/search', {
        keywords,
        location_name: 'Australia',
        language_name: 'English'
      });
      
      // Transform DataForSEO response to our format
      return this.transformKeywordData(response);
    } catch (error) {
      console.warn('DataForSEO API failed, falling back to mock data:', error);
      return mockKeywordData.filter(k => 
        keywords.some(keyword => 
          k.keyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
  }
  
  async getSERPAnalysis(keyword: string, location: string = 'Australia'): Promise<SERPAnalysis> {
    if (this.useMockData && !this.hasCredentials()) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const analysis = mockSERPAnalysis.find(s => 
        s.keyword.toLowerCase().includes(keyword.toLowerCase())
      );
      return analysis || mockSERPAnalysis[0];
    }
    
    try {
      const response = await this.callAPI('/serp/google/organic/live/regular', {
        keyword,
        location_name: location,
        language_name: 'English'
      });
      
      return this.transformSERPData(response, keyword);
    } catch (error) {
      console.warn('DataForSEO SERP API failed, falling back to mock data:', error);
      const analysis = mockSERPAnalysis.find(s => 
        s.keyword.toLowerCase().includes(keyword.toLowerCase())
      );
      return analysis || mockSERPAnalysis[0];
    }
  }
  
  async getCompetitorRankings(domain: string, keywords?: string[]): Promise<any> {
    if (this.useMockData && !this.hasCredentials()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCompetitorData.rankings.filter(r => 
        !keywords || keywords.some(k => r.keyword.includes(k))
      );
    }
    
    try {
      const response = await this.callAPI('/domain_analytics/google/organic/live', {
        target: domain,
        location_name: 'Australia',
        language_name: 'English',
        limit: 100
      });
      
      return this.transformCompetitorData(response);
    } catch (error) {
      console.warn('DataForSEO competitor API failed, falling back to mock data:', error);
      return mockCompetitorData.rankings.filter(r => 
        !keywords || keywords.some(k => r.keyword.includes(k))
      );
    }
  }
  
  async getKeywordDifficulty(keywords: string[]): Promise<any[]> {
    if (this.useMockData && !this.hasCredentials()) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return keywords.map(keyword => ({
        keyword,
        difficulty: Math.floor(Math.random() * 100),
        searchVolume: Math.floor(Math.random() * 10000),
        cpc: Math.random() * 10,
      }));
    }
    
    try {
      const response = await this.callAPI('/keywords/difficulty', {
        keywords,
        location_name: 'Australia',
        language_name: 'English'
      });
      
      return this.transformKeywordDifficulty(response);
    } catch (error) {
      console.warn('DataForSEO difficulty API failed, falling back to mock data:', error);
      return keywords.map(keyword => ({
        keyword,
        difficulty: Math.floor(Math.random() * 100),
        searchVolume: Math.floor(Math.random() * 10000),
        cpc: Math.random() * 10,
      }));
    }
  }
  
  async getBacklinkData(domain: string): Promise<any> {
    if (this.useMockData && !this.hasCredentials()) {
      await new Promise(resolve => setTimeout(resolve, 900));
      return {
        totalBacklinks: Math.floor(Math.random() * 50000),
        referringDomains: Math.floor(Math.random() * 5000),
        domainRating: Math.floor(Math.random() * 100),
        newBacklinks: Math.floor(Math.random() * 100),
        lostBacklinks: Math.floor(Math.random() * 50),
      };
    }
    
    try {
      const response = await this.callAPI('/backlinks/overview/live', {
        target: domain
      });
      
      return this.transformBacklinkData(response);
    } catch (error) {
      console.warn('DataForSEO backlink API failed, falling back to mock data:', error);
      return {
        totalBacklinks: Math.floor(Math.random() * 50000),
        referringDomains: Math.floor(Math.random() * 5000),
        domainRating: Math.floor(Math.random() * 100),
        newBacklinks: Math.floor(Math.random() * 100),
        lostBacklinks: Math.floor(Math.random() * 50),
      };
    }
  }
  
  private hasCredentials(): boolean {
    return !!(this.apiLogin && this.apiPassword);
  }
  
  private async callAPI(endpoint: string, data: any): Promise<any> {
    if (!this.hasCredentials()) {
      throw new Error('DataForSEO credentials not configured');
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${this.apiLogin}:${this.apiPassword}`)}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${result.status_message}`);
    }
    
    return result.tasks?.[0]?.result || result.data || result;
  }
  
  private transformKeywordData(response: any): KeywordData[] {
    if (!response || !Array.isArray(response)) {
      return [];
    }
    
    return response.map((item: any) => ({
      keyword: item.keyword || '',
      searchVolume: item.search_volume || 0,
      difficulty: item.keyword_difficulty || 0,
      cpc: item.cpc || 0,
      competition: item.competition || 0,
      trend: item.monthly_searches?.map((m: any) => m.search_volume) || [],
      relatedKeywords: item.related_keywords || [],
      intent: this.determineSearchIntent(item.keyword_annotations || {}),
    }));
  }
  
  private transformSERPData(response: any, keyword: string): SERPAnalysis {
    if (!response || !response.items) {
      return mockSERPAnalysis[0];
    }
    
    return {
      keyword,
      totalResults: response.total_count || 0,
      organicResults: response.items.slice(0, 10).map((item: any, index: number) => ({
        position: index + 1,
        title: item.title || '',
        url: item.url || '',
        description: item.description || '',
        domain: this.extractDomain(item.url || ''),
      })),
      featuredSnippets: response.items.filter((item: any) => item.type === 'featured_snippet').map((item: any) => ({
        type: item.snippet_type || 'paragraph',
        title: item.title || '',
        content: item.description || '',
        url: item.url || '',
      })),
      relatedQuestions: response.items.filter((item: any) => item.type === 'people_also_ask').map((item: any) => ({
        question: item.title || '',
        answer: item.description || '',
      })),
      searchVolume: 0, // This would need a separate API call
      difficulty: 0, // This would need a separate API call
    };
  }
  
  private transformCompetitorData(response: any): any {
    if (!response || !Array.isArray(response)) {
      return mockCompetitorData.rankings;
    }
    
    return response.map((item: any) => ({
      keyword: item.keyword || '',
      position: item.rank_group || 0,
      url: item.url || '',
      title: item.title || '',
      traffic: item.estimated_paid_traffic_cost || 0,
      volume: item.search_volume || 0,
    }));
  }
  
  private transformKeywordDifficulty(response: any): any[] {
    if (!response || !Array.isArray(response)) {
      return [];
    }
    
    return response.map((item: any) => ({
      keyword: item.keyword || '',
      difficulty: item.keyword_difficulty || 0,
      searchVolume: item.search_volume || 0,
      cpc: item.cpc || 0,
    }));
  }
  
  private transformBacklinkData(response: any): any {
    if (!response) {
      return {
        totalBacklinks: 0,
        referringDomains: 0,
        domainRating: 0,
        newBacklinks: 0,
        lostBacklinks: 0,
      };
    }
    
    return {
      totalBacklinks: response.backlinks || 0,
      referringDomains: response.referring_domains || 0,
      domainRating: response.rank || 0,
      newBacklinks: response.new_backlinks || 0,
      lostBacklinks: response.lost_backlinks || 0,
    };
  }
  
  private determineSearchIntent(annotations: any): 'informational' | 'commercial' | 'transactional' | 'navigational' {
    if (annotations.commercial_intent > 0.7) return 'commercial';
    if (annotations.transactional_intent > 0.7) return 'transactional';
    if (annotations.navigational_intent > 0.7) return 'navigational';
    return 'informational';
  }
  
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}

export default new DataForSEOService();