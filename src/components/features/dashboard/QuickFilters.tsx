import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Client, TaskStatus, TaskType, ToolCategory } from '../../../types';
import { Input, Select, Button } from '../../common';

interface FilterState {
  search: string;
  clientId: string;
  status: string;
  taskType: string;
  priority: string;
  assignee: string;
}

interface QuickFiltersProps {
  clients: Client[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  clients,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };
  
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');
  
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: TaskStatus.PENDING, label: 'Pending' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.REVIEW, label: 'Review' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
    { value: TaskStatus.FAILED, label: 'Failed' },
    { value: TaskStatus.CANCELLED, label: 'Cancelled' },
  ];
  
  const taskTypeOptions = [
    { value: 'all', label: 'All Task Types' },
    { value: TaskType.CONTENT_GENERATION, label: 'Content Generation' },
    { value: TaskType.STRATEGY_GENERATION, label: 'Strategy Generation' },
    { value: TaskType.MIGRATION_ANALYSIS, label: 'Migration Analysis' },
    { value: TaskType.TECHNICAL_AUDIT, label: 'Technical Audit' },
    { value: TaskType.COMPETITOR_ANALYSIS, label: 'Competitor Analysis' },
    { value: TaskType.MONITORING, label: 'Monitoring' },
    { value: TaskType.INTERNAL_LINKING, label: 'Internal Linking' },
    { value: TaskType.SCHEMA_GENERATION, label: 'Schema Generation' },
    { value: TaskType.REPORTING, label: 'Reporting' },
  ];
  
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
  
  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    ...clients.map(client => ({
      value: client.id,
      label: client.name,
    })),
  ];
  
  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'automated', label: 'Automated' },
    { value: 'sarah.johnson@bangdigital.com.au', label: 'Sarah Johnson' },
    { value: 'mike.chen@bangdigital.com.au', label: 'Mike Chen' },
    { value: 'emma.davis@bangdigital.com.au', label: 'Emma Davis' },
    { value: 'david.wilson@bangdigital.com.au', label: 'David Wilson' },
    { value: 'lisa.brown@bangdigital.com.au', label: 'Lisa Brown' },
  ];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            icon={X}
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="xl:col-span-2">
          <Input
            placeholder="Search tasks, clients, or assignees..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            icon={Search}
          />
        </div>
        
        <Select
          options={clientOptions}
          value={filters.clientId}
          onValueChange={(value) => handleFilterChange('clientId', value)}
          placeholder="Select client"
        />
        
        <Select
          options={statusOptions}
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
          placeholder="Select status"
        />
        
        <Select
          options={taskTypeOptions}
          value={filters.taskType}
          onValueChange={(value) => handleFilterChange('taskType', value)}
          placeholder="Select type"
        />
        
        <Select
          options={priorityOptions}
          value={filters.priority}
          onValueChange={(value) => handleFilterChange('priority', value)}
          placeholder="Select priority"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          options={assigneeOptions}
          value={filters.assignee}
          onValueChange={(value) => handleFilterChange('assignee', value)}
          placeholder="Select assignee"
        />
      </div>
    </div>
  );
};

export default QuickFilters;