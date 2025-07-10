import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  PenTool, 
  ArrowRightLeft, 
  Shield, 
  Users, 
  Search, 
  Link, 
  Code, 
  BarChart3 
} from 'lucide-react';
import { useToolStore } from '../../../store/toolStore';
import { Card, Badge } from '../../common';
import { Tool, ToolCategory } from '../../../types';
import { cn } from '../../../lib/utils';

const iconMap = {
  target: Target,
  'pen-tool': PenTool,
  'arrow-right-left': ArrowRightLeft,
  shield: Shield,
  users: Users,
  search: Search,
  link: Link,
  code: Code,
  'bar-chart-3': BarChart3,
};

interface ToolGridProps {
  tools: Tool[];
  selectedCategory?: ToolCategory | 'all';
  onCategoryChange?: (category: ToolCategory | 'all') => void;
}

const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  selectedCategory = 'all',
  onCategoryChange,
}) => {
  const navigate = useNavigate();
  const { launchTool, favorites, recentlyUsed } = useToolStore();
  
  const categories = [
    { id: 'all', name: 'All Tools', count: tools.length },
    { id: ToolCategory.STRATEGY, name: 'Strategy', count: tools.filter(t => t.category === ToolCategory.STRATEGY).length },
    { id: ToolCategory.CONTENT, name: 'Content', count: tools.filter(t => t.category === ToolCategory.CONTENT).length },
    { id: ToolCategory.MIGRATION, name: 'Migration', count: tools.filter(t => t.category === ToolCategory.MIGRATION).length },
    { id: ToolCategory.MONITORING, name: 'Monitoring', count: tools.filter(t => t.category === ToolCategory.MONITORING).length },
    { id: ToolCategory.COMPETITIVE, name: 'Competitive', count: tools.filter(t => t.category === ToolCategory.COMPETITIVE).length },
    { id: ToolCategory.AUTOMATION, name: 'Automation', count: tools.filter(t => t.category === ToolCategory.AUTOMATION).length },
  ];
  
  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);
  
  const handleToolClick = (tool: Tool) => {
    launchTool(tool.id);
    navigate(tool.route);
  };
  
  const getToolIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Target;
  };
  
  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-50',
      green: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-50',
      orange: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-50',
      blue: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-50',
      red: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-50',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-50',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-50',
      teal: 'bg-teal-100 text-teal-600 border-teal-200 hover:bg-teal-50',
      pink: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-50',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };
  
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id as ToolCategory | 'all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {category.name}
            <Badge variant="secondary" size="sm" className="ml-2">
              {category.count}
            </Badge>
          </button>
        ))}
      </div>
      
      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const IconComponent = getToolIcon(tool.icon);
          const isRecent = recentlyUsed.includes(tool.id);
          const isFavorite = favorites.includes(tool.id);
          
          return (
            <Card
              key={tool.id}
              className={cn(
                'p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
                getColorClasses(tool.color)
              )}
              onClick={() => handleToolClick(tool)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'h-12 w-12 rounded-lg flex items-center justify-center',
                    `bg-${tool.color}-600 text-white`
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    {isRecent && (
                      <Badge variant="info" size="sm">Recent</Badge>
                    )}
                    {isFavorite && (
                      <Badge variant="warning" size="sm">Favorite</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tool.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {tool.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {tool.applicableTo.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
                
                <Badge variant="default" size="sm">
                  {tool.category}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
      
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tools found
          </h3>
          <p className="text-gray-600">
            Try selecting a different category or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolGrid;