import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Zap,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useToolStore } from '../store/toolStore';
import { 
  MetricCard, 
  ToolGrid, 
  TaskTable, 
  QuickFilters 
} from '../components/features/dashboard';
import { TaskStatus, TaskType, ToolCategory, DashboardMetrics } from '../types';
import { mockClients, mockTasks, mockTools } from '../mock';

interface FilterState {
  search: string;
  clientId: string;
  status: string;
  taskType: string;
  priority: string;
  assignee: string;
}

const Dashboard: React.FC = () => {
  const { selectedClientId } = useAppStore();
  const { tools } = useToolStore();
  
  const [selectedToolCategory, setSelectedToolCategory] = useState<ToolCategory | 'all'>('all');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    clientId: selectedClientId || '',
    status: '',
    taskType: '',
    priority: '',
    assignee: '',
  });
  
  // Calculate dashboard metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const activeTasks = mockTasks.filter(task => 
      task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.PENDING
    ).length;
    
    const completedTasks = mockTasks.filter(task => 
      task.status === TaskStatus.COMPLETED
    ).length;
    
    const contentGenerated = mockTasks.filter(task => 
      task.type === TaskType.CONTENT_GENERATION && task.status === TaskStatus.COMPLETED
    ).length;
    
    const issuesDetected = mockTasks.filter(task => 
      task.type === TaskType.TECHNICAL_AUDIT || task.type === TaskType.MONITORING
    ).reduce((sum, task) => sum + (task.metadata?.issuesFound || 0), 0);
    
    const timeSaved = mockTasks.filter(task => 
      task.status === TaskStatus.COMPLETED
    ).length * 15; // Assuming 15 hours saved per completed task
    
    const healthyClients = mockClients.filter(client => client.status === 'active').length;
    const pausedClients = mockClients.filter(client => client.status === 'paused').length;
    const archivedClients = mockClients.filter(client => client.status === 'archived').length;
    
    return {
      activeTasks,
      completedTasks,
      contentGenerated,
      issuesDetected,
      timeSaved,
      clientHealth: {
        healthy: healthyClients,
        warning: pausedClients,
        critical: archivedClients,
      },
    };
  }, []);
  
  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const clientName = mockClients.find(c => c.id === task.clientId)?.name.toLowerCase() || '';
        const taskType = task.type.toLowerCase();
        const assignee = task.assignedTo?.toLowerCase() || '';
        
        if (!clientName.includes(searchTerm) && 
            !taskType.includes(searchTerm) && 
            !assignee.includes(searchTerm)) {
          return false;
        }
      }
      
      // Client filter
      if (filters.clientId && task.clientId !== filters.clientId) {
        return false;
      }
      
      // Status filter
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      
      // Task type filter
      if (filters.taskType && task.type !== filters.taskType) {
        return false;
      }
      
      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee && task.assignedTo !== filters.assignee) {
        return false;
      }
      
      return true;
    });
  }, [filters]);
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      clientId: '',
      status: '',
      taskType: '',
      priority: '',
      assignee: '',
    });
  };
  
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your SEO automation tools and tasks
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Tasks"
          value={metrics.activeTasks}
          icon={Clock}
          change={12}
          changeType="increase"
          color="blue"
        />
        <MetricCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          icon={CheckCircle}
          change={8}
          changeType="increase"
          color="green"
        />
        <MetricCard
          title="Content Generated"
          value={metrics.contentGenerated}
          icon={FileText}
          change={25}
          changeType="increase"
          color="purple"
        />
        <MetricCard
          title="Issues Detected"
          value={metrics.issuesDetected}
          icon={AlertTriangle}
          change={-15}
          changeType="decrease"
          color="yellow"
        />
      </div>
      
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Time Saved"
          value={metrics.timeSaved}
          icon={Zap}
          change={18}
          changeType="increase"
          color="indigo"
          format="time"
        />
        <MetricCard
          title="Client Health"
          value={`${metrics.clientHealth.healthy}/${mockClients.length}`}
          icon={Activity}
          change={5}
          changeType="increase"
          color="green"
        />
        <MetricCard
          title="Tools Available"
          value={mockTools.length}
          icon={TrendingUp}
          color="blue"
        />
      </div>
      
      {/* Quick Filters */}
      <QuickFilters
        clients={mockClients}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />
      
      {/* Tools Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">SEO Tools</h2>
          <div className="text-sm text-gray-500">
            {mockTools.length} tools available
          </div>
        </div>
        
        <ToolGrid
          tools={mockTools}
          selectedCategory={selectedToolCategory}
          onCategoryChange={setSelectedToolCategory}
        />
      </div>
      
      {/* Tasks Table */}
      <div className="space-y-6">
        <TaskTable
          tasks={filteredTasks}
          clients={mockClients}
        />
      </div>
    </div>
  );
};

export default Dashboard;