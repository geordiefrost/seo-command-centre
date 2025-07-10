import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../../common';
import { cn, formatNumber, formatPercentage } from '../../../lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: number;
  changeType?: 'increase' | 'decrease';
  color?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  color = 'blue',
  format = 'number',
  className,
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return formatPercentage(val);
      case 'currency':
        return `$${formatNumber(val)}`;
      case 'time':
        return `${val}h`;
      default:
        return formatNumber(val);
    }
  };
  
  const getChangeColor = () => {
    if (!change) return '';
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };
  
  const getIconBgColor = () => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };
  
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className={cn('flex items-center text-sm', getChangeColor())}>
              <span className="font-medium">
                {changeType === 'increase' ? '+' : ''}{change}%
              </span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', getIconBgColor())}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;