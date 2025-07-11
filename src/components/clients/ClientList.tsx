import React from 'react';
import { 
  Building, 
  Globe, 
  Users, 
  MapPin, 
  Target, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Bot,
  Search
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../common';
import { Client } from '../../types';

interface ClientListProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onStartKeywordResearch: (client: Client) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onViewClient,
  onEditClient,
  onDeleteClient,
  onStartKeywordResearch,
  searchTerm,
  onSearchChange
}) => {
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return AlertCircle;
      case 'archived': return Target;
      default: return Target;
    }
  };

  const getBusinessTypeColor = (type: string) => {
    switch (type) {
      case 'B2B': return 'bg-blue-100 text-blue-800';
      case 'B2C': return 'bg-purple-100 text-purple-800';
      case 'Local': return 'bg-green-100 text-green-800';
      case 'E-commerce': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementTypeColor = (type: string) => {
    switch (type) {
      case 'retainer': return 'bg-indigo-100 text-indigo-800';
      case 'project': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (filteredClients.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'No clients found' : 'No clients added yet'}
        </h3>
        <p className="text-gray-600 mb-4">
          {searchTerm 
            ? 'Try adjusting your search terms'
            : 'Get started by adding your first client'
          }
        </p>
        {searchTerm && (
          <Button
            variant="outline"
            onClick={() => onSearchChange('')}
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clients by name, industry, or domain..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
        </span>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const StatusIcon = getStatusIcon(client.status);
          
          return (
            <Card key={client.id} className="p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {client.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Building className="h-3 w-3 mr-1" />
                    {client.industry}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(client.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {client.status}
                  </Badge>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{client.domain}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(client.websiteUrl, '_blank')}
                  className="ml-auto"
                  icon={ExternalLink}
                ></Button>
              </div>

              {/* Business Details */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className={getBusinessTypeColor(client.businessType)}>
                  {client.businessType}
                </Badge>
                <Badge variant="secondary" className={getEngagementTypeColor(client.type)}>
                  {client.type}
                </Badge>
              </div>

              {/* Location & Markets */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{client.primaryLocation}</span>
                {client.targetMarkets && client.targetMarkets.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    +{client.targetMarkets.length} markets
                  </span>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center text-xs text-gray-500 mb-4">
                <Calendar className="h-3 w-3 mr-1" />
                Added {new Date(client.createdAt).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewClient(client)}
                  icon={Eye}
                  className="flex-1"
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartKeywordResearch(client)}
                  icon={Search}
                  className="flex-1"
                >
                  Research
                </Button>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClient(client)}
                    icon={Edit}
                  ></Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClient(client)}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-700"
                  ></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};