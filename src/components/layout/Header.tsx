import React from 'react';
import { Menu, Bell, Search, User, Settings, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAppStore } from '../../store/appStore';
import { Button, Input, Badge, ClientSelector } from '../common';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, notifications, isAuthenticated, setUser, setAuthenticated } = useAppStore();
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const handleLogout = async () => {
    try {
      // Check if Supabase is configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        await supabase.auth.signOut();
      }
      
      // Clear local state
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local state even if Supabase logout fails
      setUser(null);
      setAuthenticated(false);
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-gray-900">
            Bang SEO Command Centre
          </h1>
        </div>
      </div>
      
      {/* Center - Client Selector & Search */}
      <div className="flex-1 max-w-4xl mx-4 flex items-center space-x-4">
        {/* Client Selector */}
        <div className="flex-shrink-0">
          <ClientSelector />
        </div>
        
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Input
              placeholder="Search tools, clients, tasks..."
              icon={Search}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge
                variant="error"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>
        </div>
        
        {/* User Menu */}
        {isAuthenticated && user ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user.name}
                </span>
              </Button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="min-w-[200px] bg-white rounded-md border border-gray-200 shadow-lg p-2 z-50"
              >
                <DropdownMenu.Item className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Item className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator className="my-2 border-t border-gray-200" />
                
                <DropdownMenu.Item
                  className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <Button size="sm">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;