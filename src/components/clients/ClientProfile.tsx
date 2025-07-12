import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Globe, 
  Users, 
  MapPin, 
  Target, 
  Search, 
  Mail, 
  Phone,
  ExternalLink,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Bot,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  Eye,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { Card, Button, Badge } from '../common';
import { useAppStore } from '../../store/appStore';
import { supabase } from '../../lib/supabase';
import FirecrawlService, { QuickCrawlInsights } from '../../services/integrations/FirecrawlService';
import { 
  Client, 
  ClientCompetitor, 
  ClientBrandTerm,
  ClientCrawlData 
} from '../../types';

interface ClientProfileProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onStartKeywordResearch: () => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ 
  client, 
  onEdit, 
  onDelete,
  onStartKeywordResearch
}) => {
  const { clients } = useAppStore();
  const [competitors, setCompetitors] = useState<ClientCompetitor[]>([]);
  const [brandTerms, setBrandTerms] = useState<ClientBrandTerm[]>([]);
  const [crawlData, setCrawlData] = useState<ClientCrawlData[]>([]);
  const [latestInsights, setLatestInsights] = useState<QuickCrawlInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'insights'>('overview');

  useEffect(() => {
    loadClientData();
  }, [client.id]);

  const loadClientData = async () => {
    setIsLoading(true);
    try {
      // Load competitors
      const { data: competitorsData } = await supabase
        .from('client_competitors')
        .select('*')
        .eq('client_id', client.id)
        .order('priority', { ascending: true });

      // Load brand terms
      const { data: brandTermsData } = await supabase
        .from('client_brand_terms')
        .select('*')
        .eq('client_id', client.id);

      // Load crawl data
      const { data: crawlDataRaw } = await supabase
        .from('client_crawl_data')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      setCompetitors(competitorsData || []);
      setBrandTerms(brandTermsData || []);
      setCrawlData(crawlDataRaw || []);

      // Get latest insights
      const latestCrawl = crawlDataRaw?.[0];
      if (latestCrawl && latestCrawl.status === 'completed') {
        setLatestInsights(latestCrawl.insights as QuickCrawlInsights);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCrawl = async () => {
    setIsCrawling(true);
    try {
      const insights = await FirecrawlService.quickCrawl(client.websiteUrl);
      
      // Save crawl data to database
      const { error } = await supabase
        .from('client_crawl_data')
        .insert([{
          client_id: client.id,
          crawl_type: 'quick',
          status: 'completed',
          pages_analyzed: 1,
          insights: insights
        }]);

      if (error) throw error;

      setLatestInsights(insights);
      loadClientData(); // Refresh crawl data
    } catch (error) {
      console.error('Quick crawl failed:', error);
      alert('Failed to analyze website. Please try again.');
    } finally {
      setIsCrawling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'B2B': return Building;
      case 'B2C': return Users;
      case 'Local': return MapPin;
      case 'E-commerce': return TrendingUp;
      default: return Building;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Client Details</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              icon={Edit}
            ></Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Building className="h-4 w-4 text-gray-400 mr-2" />
              <span className="font-medium">{client.industry}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Type:</span>
              <Badge variant="secondary">{client.type}</Badge>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <Badge className={getStatusColor(client.status)}>
                {client.status}
              </Badge>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span>{client.primaryLocation}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Website</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(client.websiteUrl, '_blank')}
              icon={ExternalLink}
            ></Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-gray-400 mr-2" />
              <span className="font-medium">{client.domain}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Business:</span>
              <Badge variant="secondary">{client.businessType}</Badge>
            </div>
            {client.searchConsolePropertyId && (
              <div className="flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-xs text-gray-500">GSC Connected</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Quick Stats</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartKeywordResearch}
              icon={FileText}
            ></Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Competitors:</span>
              <span className="font-medium">{competitors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Brand Terms:</span>
              <span className="font-medium">{brandTerms.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Crawls:</span>
              <span className="font-medium">{crawlData.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Target Markets */}
      {client.targetMarkets && client.targetMarkets.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Target Markets</h4>
          <div className="flex flex-wrap gap-2">
            {client.targetMarkets.map((market, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                <MapPin className="h-3 w-3 mr-1" />
                {market}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {client.notes && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
          <p className="text-sm text-gray-600">{client.notes}</p>
        </Card>
      )}

      {/* Latest Website Analysis */}
      {latestInsights && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              Latest Website Analysis
            </h4>
            <Button
              onClick={handleQuickCrawl}
              disabled={isCrawling}
              size="sm"
              icon={isCrawling ? RefreshCw : Zap}
            >
              {isCrawling ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                latestInsights.seoScore >= 80 ? 'text-green-600' : 
                latestInsights.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {latestInsights.seoScore}
              </div>
              <div className="text-sm text-gray-600">SEO Score</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {latestInsights.wordCount}
              </div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {latestInsights.h2Count + latestInsights.h3Count}
              </div>
              <div className="text-sm text-gray-600">Headings</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {latestInsights.imageCount}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
          </div>

          {latestInsights.techStack.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Technology Stack</h5>
              <div className="flex flex-wrap gap-2">
                {latestInsights.techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {latestInsights.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-red-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Issues Found
              </h5>
              <ul className="text-sm text-red-700 space-y-1">
                {latestInsights.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {latestInsights.recommendations.length > 0 && (
            <div>
              <h5 className="font-medium text-green-800 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Recommendations
              </h5>
              <ul className="text-sm text-green-700 space-y-1">
                {latestInsights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );


  const renderCompetitors = () => (
    <div className="space-y-4">
      {competitors.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors Added</h3>
          <p className="text-gray-600 mb-4">Add competitors to track and analyze their performance</p>
          <Button onClick={onEdit} icon={Plus}>
            Add Competitor
          </Button>
        </Card>
      ) : (
        competitors.map((competitor, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {competitor.competitorName || competitor.competitorDomain}
                  </h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>{competitor.competitorDomain}</span>
                      <Badge variant="secondary" className="bg-red-50 text-red-700">
                        Priority {competitor.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://${competitor.competitorDomain}`, '_blank')}
                  icon={ExternalLink}
                ></Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* TODO: Implement competitor analysis */}}
                  icon={BarChart3}
                ></Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      {crawlData.length === 0 ? (
        <Card className="p-8 text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Website Analysis</h3>
          <p className="text-gray-600 mb-4">Analyze the website to get SEO insights and recommendations</p>
          <Button onClick={handleQuickCrawl} disabled={isCrawling} icon={Zap}>
            {isCrawling ? 'Analyzing...' : 'Analyze Website'}
          </Button>
        </Card>
      ) : (
        crawlData.map((crawl, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  {crawl.crawlType === 'quick' ? 'Quick Analysis' : 'Full Crawl'}
                </h4>
                <div className="text-sm text-gray-600">
                  {new Date(crawl.createdAt).toLocaleDateString()} • {crawl.pagesAnalyzed} pages
                </div>
              </div>
              <Badge className={
                crawl.status === 'completed' ? 'bg-green-100 text-green-800' :
                crawl.status === 'running' ? 'bg-blue-100 text-blue-800' :
                crawl.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {crawl.status}
              </Badge>
            </div>
            
            {crawl.status === 'completed' && crawl.insights && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-lg">{(crawl.insights as any).seoScore || 'N/A'}</div>
                    <div className="text-xs text-gray-600">SEO Score</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-lg">{(crawl.insights as any).wordCount || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-lg">{(crawl.insights as any).imageCount || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Images</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-lg">{(crawl.insights as any).linkCount || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Links</div>
                  </div>
                </div>
                
                {(crawl.insights as any).issues?.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">Issues</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {(crawl.insights as any).issues.map((issue: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'competitors', label: 'Competitors', icon: Target },
    { id: 'insights', label: 'Insights', icon: Bot }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h1>
          <p className="text-gray-600">{client.industry} • {client.businessType}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onStartKeywordResearch}
            icon={Search}
          >
            Keyword Research
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            icon={Edit}
          >
            Edit Client
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            icon={Trash2}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'competitors' && renderCompetitors()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
};