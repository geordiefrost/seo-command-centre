import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Bell,
  Settings,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card, Button, Select, Input } from '../components/common';

interface HealthIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'technical' | 'content' | 'performance' | 'security';
  title: string;
  description: string;
  affectedPages: number;
  impact: 'high' | 'medium' | 'low';
  detectedAt: Date;
  clientId: string;
  url?: string;
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  threshold: number;
  status: 'good' | 'needs-improvement' | 'poor';
  category: 'core-web-vitals' | 'seo' | 'accessibility' | 'best-practices';
}

interface MonitoringAlert {
  id: string;
  title: string;
  type: 'uptime' | 'performance' | 'seo' | 'security';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  clientId: string;
  resolved: boolean;
}

const Monitoring: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'issues' | 'performance' | 'alerts'>('dashboard');
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [issueFilter, setIssueFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [monitoring, setMonitoring] = useState(true);

  // Mock data
  const healthIssues: HealthIssue[] = [
    {
      id: '1',
      type: 'critical',
      category: 'technical',
      title: '404 Errors Detected',
      description: '15 pages returning 404 errors, affecting crawl budget and user experience',
      affectedPages: 15,
      impact: 'high',
      detectedAt: new Date('2024-07-10T09:30:00'),
      clientId: '1',
      url: 'https://client1.com.au/broken-pages',
      status: 'new'
    },
    {
      id: '2',
      type: 'warning',
      category: 'performance',
      title: 'Poor Core Web Vitals',
      description: 'LCP exceeding 2.5 seconds on mobile devices for key landing pages',
      affectedPages: 8,
      impact: 'medium',
      detectedAt: new Date('2024-07-10T08:15:00'),
      clientId: '1',
      url: 'https://client1.com.au/slow-pages',
      status: 'investigating'
    },
    {
      id: '3',
      type: 'warning',
      category: 'content',
      title: 'Duplicate Meta Descriptions',
      description: '23 pages have duplicate meta descriptions affecting SERP performance',
      affectedPages: 23,
      impact: 'medium',
      detectedAt: new Date('2024-07-09T14:20:00'),
      clientId: '1',
      status: 'new'
    },
    {
      id: '4',
      type: 'critical',
      category: 'security',
      title: 'SSL Certificate Expiring',
      description: 'SSL certificate expires in 7 days - immediate action required',
      affectedPages: 0,
      impact: 'high',
      detectedAt: new Date('2024-07-10T10:00:00'),
      clientId: '2',
      status: 'new'
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: '1',
      name: 'Largest Contentful Paint',
      value: 2.1,
      unit: 's',
      change: -0.3,
      threshold: 2.5,
      status: 'good',
      category: 'core-web-vitals'
    },
    {
      id: '2',
      name: 'First Input Delay',
      value: 85,
      unit: 'ms',
      change: 12,
      threshold: 100,
      status: 'good',
      category: 'core-web-vitals'
    },
    {
      id: '3',
      name: 'Cumulative Layout Shift',
      value: 0.08,
      unit: '',
      change: -0.02,
      threshold: 0.1,
      status: 'good',
      category: 'core-web-vitals'
    },
    {
      id: '4',
      name: 'SEO Score',
      value: 87,
      unit: '/100',
      change: 3,
      threshold: 90,
      status: 'needs-improvement',
      category: 'seo'
    },
    {
      id: '5',
      name: 'Accessibility Score',
      value: 92,
      unit: '/100',
      change: 1,
      threshold: 90,
      status: 'good',
      category: 'accessibility'
    },
    {
      id: '6',
      name: 'Best Practices Score',
      value: 88,
      unit: '/100',
      change: -2,
      threshold: 90,
      status: 'needs-improvement',
      category: 'best-practices'
    }
  ];

  const alerts: MonitoringAlert[] = [
    {
      id: '1',
      title: 'Site Down Alert',
      type: 'uptime',
      severity: 'critical',
      message: 'Website https://client1.com.au is unreachable (5 min downtime)',
      timestamp: new Date('2024-07-10T11:30:00'),
      clientId: '1',
      resolved: true
    },
    {
      id: '2',
      title: 'Ranking Drop Alert',
      type: 'seo',
      severity: 'warning',
      message: 'Keyword "accounting software" dropped 5 positions in SERPs',
      timestamp: new Date('2024-07-10T09:45:00'),
      clientId: '1',
      resolved: false
    },
    {
      id: '3',
      title: 'Page Speed Alert',
      type: 'performance',
      severity: 'warning',
      message: 'Average page load time increased by 40% over last 24 hours',
      timestamp: new Date('2024-07-10T08:20:00'),
      clientId: '2',
      resolved: false
    }
  ];

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Zap className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'content': return <Search className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredIssues = healthIssues.filter(issue => {
    if (selectedClient !== 'all' && issue.clientId !== selectedClient) return false;
    if (issueFilter !== 'all' && issue.type !== issueFilter) return false;
    return true;
  });

  const getHealthScore = () => {
    const criticalIssues = filteredIssues.filter(i => i.type === 'critical').length;
    const warningIssues = filteredIssues.filter(i => i.type === 'warning').length;
    const baseScore = 100;
    const score = baseScore - (criticalIssues * 15) - (warningIssues * 5);
    return Math.max(score, 0);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technical SEO Monitor</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of technical SEO issues and site health
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
          <Button
            onClick={() => setMonitoring(!monitoring)}
            variant={monitoring ? 'primary' : 'outline'}
            icon={monitoring ? Eye : Bell}
          >
            {monitoring ? 'Monitoring Active' : 'Start Monitoring'}
          </Button>
          <Button variant="outline" icon={Settings}>
            Configure
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Health Dashboard', icon: Activity },
            { id: 'issues', label: 'Issues', icon: AlertTriangle },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'alerts', label: 'Alerts', icon: Bell }
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
              {tab.id === 'issues' && filteredIssues.filter(i => i.status === 'new').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {filteredIssues.filter(i => i.status === 'new').length}
                </span>
              )}
              {tab.id === 'alerts' && alerts.filter(a => !a.resolved).length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                  {alerts.filter(a => !a.resolved).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Health Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Health Score */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1 p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  getHealthScore() >= 80 ? 'bg-green-100 text-green-600' :
                  getHealthScore() >= 60 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                }`}>
                  {getHealthScore()}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Site Health Score</h3>
              <p className="text-sm text-gray-600">Overall technical health</p>
            </Card>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {filteredIssues.filter(i => i.type === 'critical').length}
                      </div>
                      <div className="text-sm text-gray-600">Critical Issues</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {filteredIssues.filter(i => i.type === 'warning').length}
                      </div>
                      <div className="text-sm text-gray-600">Warnings</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.floor(Math.random() * 50 + 100)}
                      </div>
                      <div className="text-sm text-gray-600">Checks Passed</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Core Web Vitals */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Core Web Vitals</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Monitor className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Desktop</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Mobile</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {performanceMetrics.filter(m => m.category === 'core-web-vitals').map((metric) => (
                <div key={metric.id} className="text-center">
                  <div className={`text-3xl font-bold ${getStatusColor(metric.status)} mb-2`}>
                    {metric.value}{metric.unit}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">{metric.name}</div>
                  <div className="flex items-center justify-center space-x-1">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-red-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-600" />
                    )}
                    <span className={`text-xs ${metric.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.abs(metric.change)}{metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Issues */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Issues</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {filteredIssues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className={`p-2 rounded-lg ${getIssueColor(issue.type)}`}>
                    {getCategoryIcon(issue.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIssueColor(issue.type)}`}>
                        {issue.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{issue.affectedPages} pages affected</span>
                        <span>•</span>
                        <span>{issue.detectedAt.toLocaleTimeString()}</span>
                      </div>
                      <Button size="sm" variant="outline">Investigate</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search issues..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'info', label: 'Info' }
                ]}
                value={issueFilter}
                onValueChange={(value) => setIssueFilter(value as any)}
                placeholder="Filter by severity"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'technical', label: 'Technical' },
                  { value: 'performance', label: 'Performance' },
                  { value: 'content', label: 'Content' },
                  { value: 'security', label: 'Security' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by category"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" icon={RefreshCw}>
                Refresh
              </Button>
              <Button variant="outline" icon={Download}>
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className={`p-6 border-l-4 ${getIssueColor(issue.type)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getIssueColor(issue.type)}`}>
                      {getCategoryIcon(issue.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIssueColor(issue.type)}`}>
                          {issue.type}
                        </span>
                        <span className="text-xs text-gray-500">{issue.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{issue.impact} impact</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      Ignore
                    </Button>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{issue.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{issue.affectedPages} pages affected</span>
                    <span>•</span>
                    <span>Detected {issue.detectedAt.toLocaleDateString()}</span>
                    {issue.url && (
                      <>
                        <span>•</span>
                        <a href={issue.url} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                          <span>View details</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'new' ? 'bg-red-100 text-red-600' :
                      issue.status === 'investigating' ? 'bg-yellow-100 text-yellow-600' :
                      issue.status === 'resolved' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    metric.status === 'good' ? 'bg-green-100 text-green-600' :
                    metric.status === 'needs-improvement' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {metric.status.replace('-', ' ')}
                  </span>
                </div>

                <div className={`text-3xl font-bold ${getStatusColor(metric.status)} mb-2`}>
                  {metric.value}{metric.unit}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Threshold: {metric.threshold}{metric.unit}
                  </div>
                  <div className="flex items-center space-x-1">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-red-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-600" />
                    )}
                    <span className={`text-xs ${metric.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.abs(metric.change)}{metric.unit}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Alert History</h3>
              <p className="text-gray-600">Real-time notifications and alerts</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" icon={Settings}>
                Alert Settings
              </Button>
              <Button variant="outline" icon={Download}>
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`p-6 ${alert.resolved ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">{alert.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.resolved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        Resolved
                      </span>
                    ) : (
                      <Button size="sm" variant="outline">
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{alert.message}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {alert.timestamp.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} minutes ago
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;