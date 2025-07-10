import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowRightLeft,
  CheckCircle, 
  Clock,
  AlertTriangle,
  FileText,
  Globe,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Link,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Edit3
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Card, Button, Select, Input } from '../components/common';

interface MigrationProject {
  id: string;
  name: string;
  clientId: string;
  sourceUrl: string;
  targetUrl: string;
  status: 'planning' | 'in-progress' | 'testing' | 'completed' | 'paused';
  progress: number;
  startDate: Date;
  targetDate: Date;
  totalUrls: number;
  mappedUrls: number;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTrafficLoss: number;
}

interface UrlMapping {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  status: 'pending' | 'mapped' | 'redirected' | 'failed';
  redirectType: '301' | '302' | 'canonical' | 'no-redirect';
  trafficValue: number;
  keywordCount: number;
  backlinks: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  estimatedTime: string;
  dependencies: string[];
  critical: boolean;
}

const Migration: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'wizard' | 'mapping' | 'analysis'>('projects');
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [selectedProject, setSelectedProject] = useState<string>('1');
  const [wizardStep, setWizardStep] = useState(1);

  // Mock data
  const migrationProjects: MigrationProject[] = [
    {
      id: '1',
      name: 'Company Website Redesign',
      clientId: '1',
      sourceUrl: 'https://old.client1.com.au',
      targetUrl: 'https://new.client1.com.au',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-06-15'),
      targetDate: new Date('2024-08-01'),
      totalUrls: 485,
      mappedUrls: 315,
      riskLevel: 'medium',
      estimatedTrafficLoss: 8
    },
    {
      id: '2',
      name: 'E-commerce Platform Migration',
      clientId: '2',
      sourceUrl: 'https://store.client2.com.au',
      targetUrl: 'https://new-store.client2.com.au',
      status: 'planning',
      progress: 25,
      startDate: new Date('2024-07-20'),
      targetDate: new Date('2024-09-15'),
      totalUrls: 1247,
      mappedUrls: 89,
      riskLevel: 'high',
      estimatedTrafficLoss: 15
    }
  ];

  const urlMappings: UrlMapping[] = [
    {
      id: '1',
      sourceUrl: '/products/accounting-software',
      targetUrl: '/solutions/accounting-software',
      status: 'mapped',
      redirectType: '301',
      trafficValue: 2850,
      keywordCount: 15,
      backlinks: 23,
      priority: 'high'
    },
    {
      id: '2',
      sourceUrl: '/blog/tax-planning-guide',
      targetUrl: '/resources/tax-planning-complete-guide',
      status: 'mapped',
      redirectType: '301',
      trafficValue: 1920,
      keywordCount: 8,
      backlinks: 12,
      priority: 'high'
    },
    {
      id: '3',
      sourceUrl: '/contact-us',
      targetUrl: '/contact',
      status: 'pending',
      redirectType: '301',
      trafficValue: 850,
      keywordCount: 3,
      backlinks: 8,
      priority: 'medium'
    },
    {
      id: '4',
      sourceUrl: '/old-feature-page',
      targetUrl: '',
      status: 'pending',
      redirectType: 'no-redirect',
      trafficValue: 45,
      keywordCount: 1,
      backlinks: 0,
      priority: 'low',
      notes: 'Consider removing - low value content'
    }
  ];

  const migrationSteps: MigrationStep[] = [
    {
      id: '1',
      title: 'Content Audit & Analysis',
      description: 'Analyze all existing content and identify high-value pages',
      status: 'completed',
      estimatedTime: '1-2 weeks',
      dependencies: [],
      critical: true
    },
    {
      id: '2',
      title: 'URL Structure Planning',
      description: 'Design new URL structure and mapping strategy',
      status: 'completed',
      estimatedTime: '3-5 days',
      dependencies: ['1'],
      critical: true
    },
    {
      id: '3',
      title: 'URL Mapping & Redirects',
      description: 'Create detailed URL mapping and redirect rules',
      status: 'in-progress',
      estimatedTime: '1-2 weeks',
      dependencies: ['2'],
      critical: true
    },
    {
      id: '4',
      title: 'Content Migration',
      description: 'Migrate and optimize content for new site structure',
      status: 'pending',
      estimatedTime: '2-3 weeks',
      dependencies: ['3'],
      critical: true
    },
    {
      id: '5',
      title: 'Technical SEO Setup',
      description: 'Configure technical SEO elements (sitemaps, robots.txt, etc.)',
      status: 'pending',
      estimatedTime: '1 week',
      dependencies: ['4'],
      critical: true
    },
    {
      id: '6',
      title: 'Testing & Validation',
      description: 'Test all redirects and validate SEO implementation',
      status: 'pending',
      estimatedTime: '1 week',
      dependencies: ['5'],
      critical: true
    },
    {
      id: '7',
      title: 'Go-Live & Monitoring',
      description: 'Launch new site and monitor for issues',
      status: 'pending',
      estimatedTime: '1 week',
      dependencies: ['6'],
      critical: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'testing': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'planning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'paused': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="h-5 w-5 text-gray-400" />;
      case 'skipped': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const currentProject = migrationProjects.find(p => p.id === selectedProject);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Migration Suite</h1>
          <p className="text-gray-600 mt-1">
            Complete migration planning and execution toolkit
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
          <Button icon={Upload}>
            New Migration
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'projects', label: 'Migration Projects', icon: Globe },
            { id: 'wizard', label: 'Migration Wizard', icon: Settings },
            { id: 'mapping', label: 'URL Mapping', icon: ArrowRightLeft },
            { id: 'analysis', label: 'Impact Analysis', icon: BarChart3 }
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
            </button>
          ))}
        </nav>
      </div>

      {/* Migration Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {migrationProjects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600">
                      {clients.find(c => c.id === project.clientId)?.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium">{project.sourceUrl}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">{project.targetUrl}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">URLs</div>
                    <div className="font-semibold">{project.mappedUrls}/{project.totalUrls}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Risk</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                      {project.riskLevel}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Traffic Loss</div>
                    <div className="font-semibold text-red-600">{project.estimatedTrafficLoss}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Due: {project.targetDate.toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" icon={Eye}>
                      View
                    </Button>
                    <Button size="sm" variant="outline" icon={Edit3}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Migration Wizard Tab */}
      {activeTab === 'wizard' && (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Migration Planning Wizard</h3>
              <p className="text-gray-600">
                Step-by-step guidance for planning your website migration
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {migrationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.status === 'completed' ? 'bg-green-100 border-green-500' :
                      step.status === 'in-progress' ? 'bg-blue-100 border-blue-500' :
                      'bg-gray-100 border-gray-300'
                    }`}>
                      {getStepIcon(step.status)}
                    </div>
                    {index < migrationSteps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Details */}
            <div className="space-y-6">
              {migrationSteps.map((step, index) => (
                <div key={step.id} className={`p-6 rounded-lg border ${
                  step.status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                  step.status === 'completed' ? 'border-green-200 bg-green-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStepIcon(step.status)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.critical && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Critical
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                    </div>
                  </div>

                  {step.status === 'in-progress' && (
                    <div className="mt-4 p-4 bg-white rounded border">
                      <h5 className="font-medium text-gray-900 mb-2">Current Step: {step.title}</h5>
                      <p className="text-gray-600 text-sm mb-4">
                        You're currently working on mapping URLs and creating redirect rules. 
                        Make sure to prioritize high-traffic pages and maintain SEO value.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm">Continue Step</Button>
                        <Button size="sm" variant="outline">View Checklist</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* URL Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">URL Mapping & Redirects</h3>
              <p className="text-gray-600">Manage URL mappings and redirect rules</p>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search URLs..."
                icon={Search}
                className="w-64"
              />
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'mapped', label: 'Mapped' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' }
                ]}
                value="all"
                onValueChange={() => {}}
                placeholder="Filter by status"
              />
              <Button icon={Upload}>Import CSV</Button>
              <Button variant="outline" icon={Download}>Export</Button>
            </div>
          </div>

          {currentProject && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Project: {currentProject.name}</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {currentProject.mappedUrls} of {currentProject.totalUrls} URLs mapped
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${(currentProject.mappedUrls / currentProject.totalUrls) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {urlMappings.map((mapping) => (
              <Card key={mapping.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Source URL</div>
                        <div className="font-medium text-gray-900">{mapping.sourceUrl}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Target URL</div>
                        <div className="font-medium text-gray-900">
                          {mapping.targetUrl || <span className="text-red-600">No target set</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mapping.status)}`}>
                      {mapping.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mapping.priority)}`}>
                      {mapping.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Traffic Value</div>
                    <div className="font-semibold">{mapping.trafficValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Keywords</div>
                    <div className="font-semibold">{mapping.keywordCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Backlinks</div>
                    <div className="font-semibold">{mapping.backlinks}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Redirect Type</div>
                    <div className="font-semibold">{mapping.redirectType}</div>
                  </div>
                </div>

                {mapping.notes && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Note:</div>
                    <div className="text-sm text-yellow-700">{mapping.notes}</div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Priority: {mapping.priority} | Traffic impact: {mapping.trafficValue.toLocaleString()} visits/month
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" icon={Eye}>
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" icon={Edit3}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" icon={Link}>
                      Test Redirect
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Impact Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">8.2%</div>
                  <div className="text-sm text-gray-600">Est. Traffic Loss</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-600">High Risk URLs</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">485</div>
                  <div className="text-sm text-gray-600">Total URLs</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">125K</div>
                  <div className="text-sm text-gray-600">Monthly Traffic</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Impact Forecast</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pre-Migration Traffic</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">125K</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Week 1 (Est.)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">94K</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Week 4 (Est.)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">106K</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Week 12 (Recovery)</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">119K</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">High Risk Pages</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">23 pages</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Medium Risk Pages</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">45 pages</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Low Risk Pages</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">417 pages</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
              <Button variant="outline" icon={Download}>
                Export Report
              </Button>
            </div>

            <div className="space-y-4">
              {[
                {
                  priority: 'high',
                  title: 'Implement 301 redirects for high-traffic pages',
                  description: 'Ensure all pages with >1000 monthly visits have proper 301 redirects to maintain SEO value',
                  impact: 'Prevents 80% of potential traffic loss'
                },
                {
                  priority: 'high',
                  title: 'Update internal linking structure',
                  description: 'Modify internal links to point to new URLs before migration to minimize 404 errors',
                  impact: 'Improves crawlability and user experience'
                },
                {
                  priority: 'medium',
                  title: 'Set up comprehensive monitoring',
                  description: 'Monitor rankings, traffic, and crawl errors for 6 months post-migration',
                  impact: 'Early detection of migration issues'
                },
                {
                  priority: 'medium',
                  title: 'Content optimization opportunities',
                  description: 'Use migration as opportunity to optimize underperforming content',
                  impact: 'Potential 15-25% traffic increase'
                }
              ].map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                  <div className="text-sm text-green-600 font-medium">
                    Impact: {rec.impact}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Migration;