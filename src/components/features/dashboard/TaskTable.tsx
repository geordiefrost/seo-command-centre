import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, AlertCircle, CheckCircle, XCircle, Pause } from 'lucide-react';
import { Task, TaskStatus, TaskType, Client } from '../../../types';
import { Table, Badge, ProgressBar } from '../../common';
import { formatRelativeTime, getStatusColor, getPriorityColor } from '../../../lib/utils';

interface TaskTableProps {
  tasks: Task[];
  clients: Client[];
  loading?: boolean;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, clients, loading }) => {
  const navigate = useNavigate();
  
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };
  
  const getStatusIcon = (status: TaskStatus) => {
    const icons = {
      [TaskStatus.PENDING]: Clock,
      [TaskStatus.IN_PROGRESS]: Clock,
      [TaskStatus.REVIEW]: AlertCircle,
      [TaskStatus.COMPLETED]: CheckCircle,
      [TaskStatus.FAILED]: XCircle,
      [TaskStatus.CANCELLED]: Pause,
    };
    return icons[status] || Clock;
  };
  
  const getTaskTypeLabel = (type: TaskType) => {
    const labels = {
      [TaskType.CONTENT_GENERATION]: 'Content Generation',
      [TaskType.MIGRATION_ANALYSIS]: 'Migration Analysis',
      [TaskType.TECHNICAL_AUDIT]: 'Technical Audit',
      [TaskType.COMPETITOR_ANALYSIS]: 'Competitor Analysis',
      [TaskType.STRATEGY_GENERATION]: 'Strategy Generation',
      [TaskType.MONITORING]: 'Monitoring',
      [TaskType.INTERNAL_LINKING]: 'Internal Linking',
      [TaskType.SCHEMA_GENERATION]: 'Schema Generation',
      [TaskType.REPORTING]: 'Reporting',
    };
    return labels[type] || type;
  };
  
  const columns = [
    {
      key: 'type' as keyof Task,
      title: 'Task Type',
      render: (value: TaskType) => (
        <div className="font-medium text-gray-900">
          {getTaskTypeLabel(value)}
        </div>
      ),
    },
    {
      key: 'clientId' as keyof Task,
      title: 'Client',
      render: (clientId: string) => (
        <div className="text-gray-700">
          {getClientName(clientId)}
        </div>
      ),
    },
    {
      key: 'status' as keyof Task,
      title: 'Status',
      render: (status: TaskStatus, task: Task) => {
        const StatusIcon = getStatusIcon(status);
        return (
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-4 w-4 text-${getStatusColor(status)}-600`} />
            <Badge variant={getStatusColor(status) as any} size="sm">
              {status.replace('_', ' ')}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'progress' as keyof Task,
      title: 'Progress',
      render: (progress: number) => (
        <div className="w-full">
          <ProgressBar
            value={progress}
            size="sm"
            variant={progress === 100 ? 'success' : 'default'}
          />
          <span className="text-xs text-gray-500 mt-1">{progress}%</span>
        </div>
      ),
    },
    {
      key: 'priority' as keyof Task,
      title: 'Priority',
      render: (priority: string) => (
        <Badge variant={getPriorityColor(priority) as any} size="sm">
          {priority}
        </Badge>
      ),
    },
    {
      key: 'assignedTo' as keyof Task,
      title: 'Assignee',
      render: (assignedTo?: string) => (
        <div className="flex items-center space-x-2">
          {assignedTo ? (
            <>
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                {assignedTo === 'automated' ? 'Automated' : assignedTo.split('@')[0]}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'dueDate' as keyof Task,
      title: 'Due Date',
      render: (dueDate?: Date) => (
        <div className="text-sm text-gray-600">
          {dueDate ? formatRelativeTime(dueDate) : 'No due date'}
        </div>
      ),
    },
    {
      key: 'updatedAt' as keyof Task,
      title: 'Last Updated',
      render: (updatedAt: Date) => (
        <div className="text-sm text-gray-500">
          {formatRelativeTime(updatedAt)}
        </div>
      ),
    },
  ];
  
  const handleRowClick = (task: Task) => {
    // Navigate to task details or tool page
    switch (task.type) {
      case TaskType.CONTENT_GENERATION:
        navigate('/content');
        break;
      case TaskType.STRATEGY_GENERATION:
        navigate('/strategy');
        break;
      case TaskType.MIGRATION_ANALYSIS:
        navigate('/migration');
        break;
      case TaskType.TECHNICAL_AUDIT:
        navigate('/monitoring');
        break;
      case TaskType.COMPETITOR_ANALYSIS:
        navigate('/competitive');
        break;
      default:
        navigate('/automation');
    }
  };
  
  const getRowClassName = (task: Task) => {
    if (task.status === TaskStatus.FAILED) {
      return 'bg-red-50 hover:bg-red-100';
    }
    if (task.priority === 'critical') {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    return '';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Active Tasks</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>On Track</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <span>At Risk</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span>Failed</span>
          </div>
        </div>
      </div>
      
      <Table
        data={tasks}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        rowClassName={getRowClassName}
        emptyMessage="No active tasks found"
      />
    </div>
  );
};

export default TaskTable;