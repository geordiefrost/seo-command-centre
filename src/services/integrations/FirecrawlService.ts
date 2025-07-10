import { CrawlResult, TechnicalIssue } from '../../types';
import { mockCrawlResults, mockTechnicalIssues, mockCrawlSummary } from '../../mock/integrations/firecrawl';

class FirecrawlService {
  private useMockData = import.meta.env.VITE_MOCK_MODE === 'true';
  private apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
  private baseURL = 'https://api.firecrawl.dev/v1';
  
  async crawlWebsite(url: string, options?: any): Promise<{ jobId: string }> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { jobId: `mock-job-${Date.now()}` };
    }
    
    return this.callAPI('/crawl', { url, ...options });
  }
  
  async getCrawlResults(jobId: string): Promise<CrawlResult[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockCrawlResults;
    }
    
    const response = await this.callAPI(`/crawl/${jobId}`, {}, 'GET');
    return response.results || [];
  }
  
  async getCrawlStatus(jobId: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        status: 'completed',
        progress: 100,
        pagesScanned: 156,
        totalPages: 156,
        startTime: new Date(Date.now() - 2700000), // 45 minutes ago
        endTime: new Date(),
      };
    }
    
    return this.callAPI(`/crawl/${jobId}/status`, {}, 'GET');
  }
  
  async scrapePage(url: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const mockPage = mockCrawlResults.find(r => r.url === url) || mockCrawlResults[0];
      return {
        url: mockPage.url,
        title: mockPage.title,
        content: 'Mock page content...',
        markdown: '# Mock Page\n\nThis is mock content for testing.',
        metadata: {
          title: mockPage.title,
          description: mockPage.metaDescription,
          keywords: 'mock, testing, seo',
        },
      };
    }
    
    return this.callAPI('/scrape', { url });
  }
  
  async getTechnicalIssues(url: string): Promise<TechnicalIssue[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return mockTechnicalIssues;
    }
    
    const response = await this.callAPI('/audit', { url });
    return response.issues || [];
  }
  
  async getCrawlSummary(jobId: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockCrawlSummary;
    }
    
    return this.callAPI(`/crawl/${jobId}/summary`, {}, 'GET');
  }
  
  async extractUrls(url: string, maxUrls: number = 1000): Promise<string[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 900));
      const baseUrl = new URL(url);
      return Array.from({ length: Math.min(maxUrls, 156) }, (_, i) => 
        `${baseUrl.origin}/page-${i + 1}`
      );
    }
    
    const response = await this.callAPI('/extract-urls', { url, maxUrls });
    return response.urls || [];
  }
  
  async analyzeSitemap(sitemapUrl: string): Promise<any> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        totalUrls: 156,
        validUrls: 152,
        invalidUrls: 4,
        lastModified: new Date(),
        urls: mockCrawlResults.map(r => r.url),
      };
    }
    
    return this.callAPI('/sitemap/analyze', { sitemapUrl });
  }
  
  private async callAPI(endpoint: string, data: any = {}, method: string = 'POST'): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Firecrawl API key not configured');
    }
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    };
    
    if (method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export default new FirecrawlService();