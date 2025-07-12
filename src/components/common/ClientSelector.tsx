import React from 'react';
import { ChevronDown, Building, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAppStore } from '../../store/appStore';
import Button from './Button';
import { cn } from '../../lib/utils';

interface ClientSelectorProps {
  className?: string;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ className }) => {
  const { clients, selectedClientId, selectClient } = useAppStore();
  
  const selectedClient = clients.find(client => client.id === selectedClientId);
  
  const handleClientSelect = (clientId: string) => {
    selectClient(clientId);
  };
  
  if (clients.length === 0) {
    return (
      <div className={cn("text-sm text-gray-500 px-3 py-2", className)}>
        No clients available
      </div>
    );
  }
  
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center justify-between min-w-[200px] max-w-[300px]",
            className
          )}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">
              {selectedClient ? selectedClient.name : 'Select Client'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="min-w-[280px] max-w-[400px] bg-white rounded-md border border-gray-200 shadow-lg p-2 z-50 max-h-[300px] overflow-y-auto"
        >
          {clients.map((client) => (
            <DropdownMenu.Item
              key={client.id}
              className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClientSelect(client.id)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {client.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {client.industry} • {client.businessType}
                  </div>
                </div>
              </div>
              {selectedClientId === client.id && (
                <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
            </DropdownMenu.Item>
          ))}
          
          {selectedClientId && (
            <>
              <DropdownMenu.Separator className="my-2 border-t border-gray-200" />
              <DropdownMenu.Item
                className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer text-gray-600"
                onClick={() => selectClient(null)}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <span>View All Clients</span>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};