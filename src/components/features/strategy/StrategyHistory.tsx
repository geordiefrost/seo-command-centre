import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Eye, 
  Edit3, 
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Users,
  FileText
} from 'lucide-react';
import { Card, Button, Select, Input, Badge } from '../../common';
import { useAppStore } from '../../../store/appStore';

interface StrategyHistoryItem {
  id: string;
  title: string;
  clientId: string;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  timeline: string;
  budget: string;
  goals: string;
  performance?: {
    trafficIncrease: number;
    rankingImprovement: number;
    conversionsIncrease: number;
    tasksCompleted: number;
    tasksTotal: number;
  };
  createdBy: string;
  lastReviewed?: Date;
}

export const StrategyHistory: React.FC = () => {
  const { clients, selectedClientId } = useAppStore();
  const [selectedClient, setSelectedClient] = useState(selectedClientId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed' | 'paused' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'performance' | 'status'>('date');

  // Mock data for strategy history
  const strategyHistory: StrategyHistoryItem[] = [
    {
      id: '1',
      title: 'Q3 2024 Growth Strategy',
      clientId: '1',
      status: 'active',
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-07-10'),
      timeline: '6-months',
      budget: '10k-25k',
      goals: 'Increase organic traffic by 150%',
      performance: {
        trafficIncrease: 45,
        rankingImprovement: 12,
        conversionsIncrease: 28,
        tasksCompleted: 18,
        tasksTotal: 25
      },
      createdBy: 'Sarah Johnson',
      lastReviewed: new Date('2024-07-05')
    },
    {
      id: '2',
      title: 'Local SEO Domination Plan',
      clientId: '2',
      status: 'completed',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-06-20'),
      timeline: '3-months',
      budget: '5k-10k',
      goals: 'Dominate local search results',
      performance: {
        trafficIncrease: 78,
        rankingImprovement: 35,
        conversionsIncrease: 42,
        tasksCompleted: 22,
        tasksTotal: 22
      },
      createdBy: 'Mike Chen',
      lastReviewed: new Date('2024-06-18')
    },
    {
      id: '3',
      title: 'Content Authority Strategy',
      clientId: '1',
      status: 'paused',
      createdAt: new Date('2024-05-10'),
      updatedAt: new Date('2024-06-15'),
      timeline: '12-months',
      budget: '25k-50k',
      goals: 'Establish thought leadership',
      performance: {
        trafficIncrease: 22,
        rankingImprovement: 8,
        conversionsIncrease: 15,
        tasksCompleted: 8,
        tasksTotal: 30
      },
      createdBy: 'Emma Davis',
      lastReviewed: new Date('2024-06-10')
    },
    {
      id: '4',
      title: 'Technical SEO Overhaul',
      clientId: '3',
      status: 'draft',
      createdAt: new Date('2024-07-08'),
      updatedAt: new Date('2024-07-08'),
      timeline: '3-months',
      budget: 'under-5k',
      goals: 'Fix technical SEO issues',
      createdBy: 'David Wilson'
    },
    {
      id: '5',
      title: 'E-commerce SEO Strategy',
      clientId: '2',
      status: 'archived',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-15'),
      timeline: '6-months',
      budget: '10k-25k',
      goals: 'Increase product page rankings',
      performance: {
        trafficIncrease: 95,
        rankingImprovement: 28,
        conversionsIncrease: 65,
        tasksCompleted: 35,
        tasksTotal: 35
      },
      createdBy: 'Sarah Johnson',
      lastReviewed: new Date('2024-03-10')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Target className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertTriangle className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'archived': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredStrategies = strategyHistory.filter(strategy => {
    const matchesClient = selectedClient === 'all' || strategy.clientId === selectedClient;
    const matchesStatus = statusFilter === 'all' || strategy.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.goals.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesClient && matchesStatus && matchesSearch;
  });

  const sortedStrategies = [...filteredStrategies].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'performance':
        const aPerf = a.performance?.trafficIncrease || 0;
        const bPerf = b.performance?.trafficIncrease || 0;
        return bPerf - aPerf;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search strategies..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
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
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'paused', label: 'Paused' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' }
            ]}
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as any)}
            placeholder="Filter by status"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'performance', label: 'Sort by Performance' },
              { value: 'status', label: 'Sort by Status' }
            ]}
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
            placeholder="Sort by"
          />
          <Button variant="outline" icon={Download}>
            Export
          </Button>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedStrategies.map((strategy) => {
          const client = clients.find(c => c.id === strategy.clientId);
          return (
            <Card key={strategy.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{strategy.title}</h3>
                  <p className="text-sm text-gray-600">{client?.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(strategy.status)}>
                    {getStatusIcon(strategy.status)}
                    <span className="ml-1 capitalize">{strategy.status}</span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-medium">{strategy.goals}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{strategy.timeline}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{strategy.budget}</span>
                  </div>
                </div>
              </div>

              {strategy.performance && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          +{strategy.performance.trafficIncrease}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Traffic Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-lg font-bold text-blue-600">
                          +{strategy.performance.rankingImprovement}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Ranking Positions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Task Progress:</span>
                    <span className="font-medium">
                      {strategy.performance.tasksCompleted}/{strategy.performance.tasksTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(strategy.performance.tasksCompleted / strategy.performance.tasksTotal) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <div>Created by {strategy.createdBy}</div>
                  <div>Updated {strategy.updatedAt.toLocaleDateString()}</div>
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
          );
        })}
      </div>

      {sortedStrategies.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || selectedClient !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Create your first SEO strategy to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};