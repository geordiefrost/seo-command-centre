import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Target,
  PenTool,
  ArrowRightLeft,
  Shield,
  Users,
  Settings,
  Zap,
  BarChart3,
  X,
  UserCheck,
  Activity,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useIntegrationStore } from '../../store/integrationStore';
import { Button, Badge } from '../common';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Clients', href: '/clients', icon: UserCheck, enabled: true },
  { name: 'Keyword Research', href: '/keyword-research', icon: Search, enabled: true },
  { name: 'Dashboard', href: '/', icon: Home, enabled: false },
  { name: 'Strategy', href: '/strategy', icon: Target, enabled: false },
  { name: 'Content', href: '/content', icon: PenTool, enabled: false },
  { name: 'Migration', href: '/migration', icon: ArrowRightLeft, enabled: false },
  { name: 'Monitoring', href: '/monitoring', icon: Shield, enabled: false },
  { name: 'Competitive', href: '/competitive', icon: Users, enabled: false },
  { name: 'Automation', href: '/automation', icon: Zap, enabled: false },
  { name: 'Reports', href: '/reports', icon: BarChart3, enabled: false },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { getConnectedIntegrations, getDisconnectedIntegrations } = useIntegrationStore();
  
  const connectedIntegrations = getConnectedIntegrations();
  const disconnectedIntegrations = getDisconnectedIntegrations();
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BSC</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-sm">Bang SEO Command Centre</span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden text-white hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.enabled ? item.href : '#'}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  !item.enabled
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
              onClick={(e) => {
                if (!item.enabled) {
                  e.preventDefault();
                  return;
                }
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
            >
              <item.icon className="h-5 w-5" />
              {!sidebarCollapsed && (
                <span className="flex items-center justify-between w-full">
                  {item.name}
                  {!item.enabled && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Integration Status */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Integrations
              </span>
              <Badge variant="secondary" size="sm">
                {connectedIntegrations.length}/{connectedIntegrations.length + disconnectedIntegrations.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {connectedIntegrations.slice(0, 3).map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-400">{integration.name}</span>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
              
              {disconnectedIntegrations.slice(0, 2).map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-400">{integration.name}</span>
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                </div>
              ))}
            </div>
            
            <NavLink
              to="/settings"
              className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <div className="relative flex flex-col w-64 h-full">
            <SidebarContent />
          </div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      )}>
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;