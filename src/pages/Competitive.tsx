import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Globe,
  Users,
  Link,
  ExternalLink,
  Calendar,
  Clock,
  Target,
  Zap,
  RefreshCw,
  Download,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card, Button, Select, Input } from '../components/common';

interface Competitor {
  id: string;
  name: string;
  domain: string;
  category: 'direct' | 'indirect' | 'aspirational';
  clientId: string;
  isTracked: boolean;
  lastAnalyzed: Date;
  metrics: {
    organicKeywords: number;
    estimatedTraffic: number;
    domainRating: number;
    backlinks: number;
    referringDomains: number;
  };
}

interface CompetitorChange {
  id: string;
  competitorId: string;
  type: 'ranking' | 'content' | 'backlink' | 'technical';
  changeType: 'gain' | 'loss' | 'new' | 'removed';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  detectedAt: Date;
  url?: string;
  keyword?: string;
  rankingChange?: number;
}

interface KeywordGap {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  yourRank: number | null;
  competitorRanks: { [competitorId: string]: number };
  opportunity: 'high' | 'medium' | 'low';
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
}

interface ContentGap {
  id: string;
  topic: string;
  competitorId: string;
  contentType: 'blog-post' | 'landing-page' | 'guide' | 'tool' | 'resource';
  estimatedTraffic: number;
  keywordCount: number;
  url: string;
  publishedDate: Date;
  opportunity: 'high' | 'medium' | 'low';
}

const Competitive: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracking' | 'changes' | 'gaps'>('dashboard');
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Mock data
  const competitors: Competitor[] = [
    {
      id: '1',
      name: 'Xero',
      domain: 'xero.com',
      category: 'direct',
      clientId: '1',
      isTracked: true,
      lastAnalyzed: new Date('2024-07-10T08:00:00'),
      metrics: {
        organicKeywords: 58420,
        estimatedTraffic: 2850000,
        domainRating: 91,
        backlinks: 1250000,
        referringDomains: 28500
      }
    },
    {
      id: '2',
      name: 'QuickBooks',
      domain: 'quickbooks.intuit.com',
      category: 'direct',
      clientId: '1',
      isTracked: true,
      lastAnalyzed: new Date('2024-07-10T08:00:00'),
      metrics: {
        organicKeywords: 45230,
        estimatedTraffic: 1950000,
        domainRating: 88,
        backlinks: 985000,
        referringDomains: 22100
      }
    },
    {
      id: '3',
      name: 'FreshBooks',
      domain: 'freshbooks.com',
      category: 'direct',
      clientId: '1',
      isTracked: true,
      lastAnalyzed: new Date('2024-07-10T08:00:00'),
      metrics: {
        organicKeywords: 28150,
        estimatedTraffic: 890000,
        domainRating: 79,
        backlinks: 420000,
        referringDomains: 12800
      }
    },
    {
      id: '4',
      name: 'Sage',
      domain: 'sage.com',
      category: 'indirect',
      clientId: '1',
      isTracked: false,
      lastAnalyzed: new Date('2024-07-08T08:00:00'),
      metrics: {
        organicKeywords: 35600,
        estimatedTraffic: 1250000,
        domainRating: 85,
        backlinks: 680000,
        referringDomains: 18200
      }
    }
  ];

  const competitorChanges: CompetitorChange[] = [
    {
      id: '1',
      competitorId: '1',
      type: 'ranking',
      changeType: 'gain',
      title: 'Xero gains top 3 ranking for "accounting software small business"',
      description: 'Moved from position 5 to position 2 for high-volume commercial keyword',
      impact: 'high',
      detectedAt: new Date('2024-07-09T14:30:00'),
      keyword: 'accounting software small business',
      rankingChange: 3
    },
    {
      id: '2',
      competitorId: '2',
      type: 'content',
      changeType: 'new',
      title: 'QuickBooks publishes comprehensive tax guide',
      description: 'New 5000-word guide targeting tax preparation keywords during peak season',
      impact: 'medium',
      detectedAt: new Date('2024-07-09T10:15:00'),
      url: 'https://quickbooks.intuit.com/resources/tax-guide-2024'
    },
    {
      id: '3',
      competitorId: '3',
      type: 'backlink',
      changeType: 'gain',
      title: 'FreshBooks secures high-authority backlink from Forbes',
      description: 'Featured in Forbes article about small business accounting best practices',
      impact: 'high',
      detectedAt: new Date('2024-07-08T16:45:00'),
      url: 'https://forbes.com/small-business-accounting-2024'
    },
    {
      id: '4',
      competitorId: '1',
      type: 'technical',
      changeType: 'gain',
      title: 'Xero improves Core Web Vitals scores',
      description: 'Significant improvements in LCP and CLS across key landing pages',
      impact: 'medium',
      detectedAt: new Date('2024-07-08T09:20:00')
    }
  ];

  const keywordGaps: KeywordGap[] = [
    {
      id: '1',
      keyword: 'cloud accounting software australia',
      searchVolume: 2900,
      difficulty: 45,
      yourRank: null,
      competitorRanks: { '1': 2, '2': 4, '3': 8 },
      opportunity: 'high',
      intent: 'commercial'
    },
    {
      id: '2',
      keyword: 'accounting software for startups',
      searchVolume: 1800,
      difficulty: 38,
      yourRank: 15,
      competitorRanks: { '1': 1, '2': 3, '3': 7 },
      opportunity: 'high',
      intent: 'commercial'
    },
    {
      id: '3',
      keyword: 'best accounting app australia',
      searchVolume: 1200,
      difficulty: 42,
      yourRank: null,
      competitorRanks: { '1': 3, '2': 1, '3': 6 },
      opportunity: 'medium',
      intent: 'commercial'
    },
    {
      id: '4',
      keyword: 'accounting software comparison 2024',
      searchVolume: 950,
      difficulty: 35,
      yourRank: 8,
      competitorRanks: { '1': 2, '2': 1, '3': 4 },
      opportunity: 'medium',
      intent: 'informational'
    }
  ];

  const contentGaps: ContentGap[] = [
    {
      id: '1',
      topic: 'Small Business Tax Deductions Guide',
      competitorId: '2',
      contentType: 'guide',
      estimatedTraffic: 15000,
      keywordCount: 25,
      url: 'https://quickbooks.intuit.com/resources/tax-deductions-guide',
      publishedDate: new Date('2024-06-15'),
      opportunity: 'high'
    },
    {
      id: '2',
      topic: 'Accounting Software ROI Calculator',
      competitorId: '1',
      contentType: 'tool',
      estimatedTraffic: 8500,
      keywordCount: 12,
      url: 'https://xero.com/tools/roi-calculator',
      publishedDate: new Date('2024-06-20'),
      opportunity: 'high'
    },
    {
      id: '3',
      topic: 'Cash Flow Management Templates',
      competitorId: '3',
      contentType: 'resource',
      estimatedTraffic: 5200,
      keywordCount: 18,
      url: 'https://freshbooks.com/templates/cash-flow',
      publishedDate: new Date('2024-06-25'),
      opportunity: 'medium'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'direct': return 'text-red-600 bg-red-100';
      case 'indirect': return 'text-yellow-600 bg-yellow-100';
      case 'aspirational': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'gain': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'loss': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'new': return <Plus className="h-4 w-4 text-blue-600" />;
      case 'removed': return <Minus className="h-4 w-4 text-red-600" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ranking': return <TrendingUp className="h-4 w-4" />;
      case 'content': return <Target className="h-4 w-4" />;
      case 'backlink': return <Link className="h-4 w-4" />;
      case 'technical': return <Zap className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitive Intelligence</h1>
          <p className="text-gray-600 mt-1">
            Track competitors and identify opportunities in your market
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            options={[
              { value: 'all', label: 'All Clients' },
              ...clients.map(client => ({ value: client.id, label: client.name }))
            ]}
            value={selectedClient}
            onValueChange={setSelectedClient}
            placeholder="Select client"
          />
          <Select
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' }
            ]}
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
            placeholder="Timeframe"
          />
          <Button icon={Plus}>
            Add Competitor
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'tracking', label: 'Competitor Tracking', icon: Eye },
            { id: 'changes', label: 'Change Log', icon: RefreshCw },
            { id: 'gaps', label: 'Gap Analysis', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${
                activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.label}
              {tab.id === 'changes' && competitorChanges.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {competitorChanges.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{competitors.filter(c => c.isTracked).length}</div>
                  <div className="text-sm text-gray-600">Tracked Competitors</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{keywordGaps.filter(k => k.opportunity === 'high').length}</div>
                  <div className="text-sm text-gray-600">High Opportunities</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{competitorChanges.filter(c => c.impact === 'high').length}</div>
                  <div className="text-sm text-gray-600">High Impact Changes</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{contentGaps.length}</div>
                  <div className="text-sm text-gray-600">Content Gaps</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Market Share Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Market Share Analysis</h3>
              <Button variant="outline" size="sm" icon={Download}>
                Export Report
              </Button>
            </div>

            <div className="space-y-4">
              {competitors.filter(c => c.isTracked).map((competitor, index) => (
                <div key={competitor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-yellow-500' :
                        index === 2 ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                      <p className="text-sm text-gray-600">{competitor.domain}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {(competitor.metrics.estimatedTraffic / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-gray-500">Monthly Traffic</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {(competitor.metrics.organicKeywords / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-gray-500">Keywords</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {competitor.metrics.domainRating}
                      </div>
                      <div className="text-xs text-gray-500">Domain Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {(competitor.metrics.referringDomains / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-gray-500">Ref. Domains</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Changes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Competitor Changes</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {competitorChanges.slice(0, 3).map((change) => {
                const competitor = competitors.find(c => c.id === change.competitorId);
                return (
                  <div key={change.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${getImpactColor(change.impact)}`}>
                      {getTypeIcon(change.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{change.title}</h4>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(change.changeType)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(change.impact)}`}>
                            {change.impact} impact
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{change.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{competitor?.name}</span>
                          <span>•</span>
                          <span>{change.detectedAt.toLocaleDateString()}</span>
                          {change.keyword && (
                            <>
                              <span>•</span>
                              <span>Keyword: {change.keyword}</span>
                            </>
                          )}
                        </div>
                        {change.url && (
                          <a href={change.url} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                            <span className="text-xs">View</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Competitor Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search competitors..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'direct', label: 'Direct' },
                  { value: 'indirect', label: 'Indirect' },
                  { value: 'aspirational', label: 'Aspirational' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by category"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" icon={RefreshCw}>
                Refresh Data
              </Button>
              <Button variant="outline" icon={Settings}>
                Configure
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {competitors.map((competitor) => (
              <Card key={competitor.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{competitor.name}</h3>
                    <div className="flex items-center space-x-2">
                      <a href={`https://${competitor.domain}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        {competitor.domain}
                      </a>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(competitor.category)}`}>
                      {competitor.category}
                    </span>
                    <Button
                      size="sm"
                      variant={competitor.isTracked ? 'primary' : 'outline'}
                      onClick={() => {}}
                    >
                      {competitor.isTracked ? 'Tracking' : 'Track'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Organic Traffic</div>
                    <div className="text-lg font-bold text-gray-900">
                      {(competitor.metrics.estimatedTraffic / 1000000).toFixed(1)}M
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+12% vs last month</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Keywords</div>
                    <div className="text-lg font-bold text-gray-900">
                      {(competitor.metrics.organicKeywords / 1000).toFixed(0)}K
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+850 new</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Domain Rating</div>
                    <div className="font-semibold">{competitor.metrics.domainRating}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Backlinks</div>
                    <div className="font-semibold">{(competitor.metrics.backlinks / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ref. Domains</div>
                    <div className="font-semibold">{(competitor.metrics.referringDomains / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Last analyzed: {competitor.lastAnalyzed.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" icon={Eye}>
                      Details
                    </Button>
                    <Button size="sm" variant="outline" icon={BarChart3}>
                      Compare
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === 'changes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search changes..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'ranking', label: 'Rankings' },
                  { value: 'content', label: 'Content' },
                  { value: 'backlink', label: 'Backlinks' },
                  { value: 'technical', label: 'Technical' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by type"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Impact' },
                  { value: 'high', label: 'High Impact' },
                  { value: 'medium', label: 'Medium Impact' },
                  { value: 'low', label: 'Low Impact' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by impact"
              />
            </div>
            <Button variant="outline" icon={Download}>
              Export Changes
            </Button>
          </div>

          <div className="space-y-4">
            {competitorChanges.map((change) => {
              const competitor = competitors.find(c => c.id === change.competitorId);
              return (
                <Card key={change.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getImpactColor(change.impact)}`}>
                        {getTypeIcon(change.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{change.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">{competitor?.name}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(change.impact)}`}>
                            {change.impact} impact
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{change.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(change.changeType)}
                      <span className="text-sm text-gray-500">
                        {change.detectedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{change.description}</p>

                  {change.keyword && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-blue-800">Target Keyword:</span>
                          <span className="text-sm text-blue-700 ml-2">{change.keyword}</span>
                        </div>
                        {change.rankingChange && (
                          <div className="flex items-center space-x-1">
                            {change.rankingChange > 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm font-semibold ${
                              change.rankingChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {Math.abs(change.rankingChange)} positions
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Detected {Math.floor((Date.now() - change.detectedAt.getTime()) / (1000 * 60 * 60))} hours ago
                    </div>
                    {change.url && (
                      <a href={change.url} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                        <span className="text-sm">View source</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Gap Analysis Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Keyword Gaps */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Keyword Gaps</h3>
                <Button variant="outline" size="sm" icon={Download}>
                  Export
                </Button>
              </div>

              <div className="space-y-4">
                {keywordGaps.slice(0, 4).map((gap) => (
                  <div key={gap.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{gap.keyword}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(gap.opportunity)}`}>
                        {gap.opportunity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Search Volume</div>
                        <div className="font-semibold">{gap.searchVolume.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Difficulty</div>
                        <div className="font-semibold">{gap.difficulty}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Your Rank</div>
                        <div className="font-semibold">{gap.yourRank || 'Not ranking'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-gray-500">Competitors:</span>
                      {Object.entries(gap.competitorRanks).map(([competitorId, rank]) => {
                        const competitor = competitors.find(c => c.id === competitorId);
                        return (
                          <span key={competitorId} className="flex items-center space-x-1">
                            <span>{competitor?.name}</span>
                            <span className="font-semibold">#{rank}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Content Gaps */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Gaps</h3>
                <Button variant="outline" size="sm" icon={Download}>
                  Export
                </Button>
              </div>

              <div className="space-y-4">
                {contentGaps.map((gap) => {
                  const competitor = competitors.find(c => c.id === gap.competitorId);
                  return (
                    <div key={gap.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{gap.topic}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(gap.opportunity)}`}>
                          {gap.opportunity}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {competitor?.name} • {gap.contentType.replace('-', ' ')}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500">Est. Traffic</div>
                          <div className="font-semibold">{gap.estimatedTraffic.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Keywords</div>
                          <div className="font-semibold">{gap.keywordCount}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Published {gap.publishedDate.toLocaleDateString()}
                        </div>
                        <a href={gap.url} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                          <span className="text-xs">View content</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Competitive;