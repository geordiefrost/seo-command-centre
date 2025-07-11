import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Building, 
  Calendar,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components/common';
import { ClientList } from '../components/clients/ClientList';
import { ClientOnboardingWizard } from '../components/clients/ClientOnboardingWizard';
import { ClientProfile } from '../components/clients/ClientProfile';
import { useAppStore } from '../store/appStore';
import { Client } from '../types';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, removeClient, selectClient } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Client | null>(null);

  // Client statistics
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    paused: clients.filter(c => c.status === 'paused').length,
    archived: clients.filter(c => c.status === 'archived').length,
    retainer: clients.filter(c => c.type === 'retainer').length,
    project: clients.filter(c => c.type === 'project').length,
    b2b: clients.filter(c => c.businessType === 'B2B').length,
    b2c: clients.filter(c => c.businessType === 'B2C').length,
    local: clients.filter(c => c.businessType === 'Local').length,
    ecommerce: clients.filter(c => c.businessType === 'E-commerce').length
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowProfile(true);
    selectClient(client.id);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setSelectedClient(client);
    setShowOnboarding(true);
  };

  const handleDeleteClient = (client: Client) => {
    setShowDeleteConfirm(client);
  };

  const confirmDeleteClient = () => {
    if (showDeleteConfirm) {
      removeClient(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
      
      // Close profile if we're viewing the deleted client
      if (selectedClient?.id === showDeleteConfirm.id) {
        setShowProfile(false);
        setSelectedClient(null);
        selectClient(null);
      }
    }
  };

  const handleStartKeywordResearch = (client: Client) => {
    // TODO: Implement keyword research navigation
    console.log('Starting keyword research for:', client.name);
    alert(`Keyword research for ${client.name} - Coming soon!`);
  };

  const handleOnboardingComplete = (client: Client) => {
    if (editingClient) {
      // Update existing client
      updateClient(editingClient.id, client);
      setEditingClient(null);
    } else {
      // Add new client
      addClient(client);
    }
    setShowOnboarding(false);
    setSelectedClient(client);
    setShowProfile(true);
    selectClient(client.id);
  };

  const handleOnboardingCancel = () => {
    setShowOnboarding(false);
    setEditingClient(null);
    setSelectedClient(null);
  };

  const handleProfileEdit = () => {
    setShowProfile(false);
    handleEditClient(selectedClient!);
  };

  const handleProfileDelete = () => {
    setShowProfile(false);
    if (selectedClient) {
      handleDeleteClient(selectedClient);
    }
  };

  const handleProfileStartKeywordResearch = () => {
    if (selectedClient) {
      handleStartKeywordResearch(selectedClient);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your client relationships and track their SEO performance
          </p>
        </div>
        <Button
          onClick={() => setShowOnboarding(true)}
          icon={Plus}
        >
          Add New Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retainer</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.retainer}</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">B2B</p>
              <p className="text-2xl font-bold text-purple-600">{stats.b2b}</p>
            </div>
            <Building className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Client List */}
      <ClientList
        clients={clients}
        onViewClient={handleViewClient}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
        onStartKeywordResearch={handleStartKeywordResearch}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <Modal
          open={showOnboarding}
          onOpenChange={(open) => !open && handleOnboardingCancel()}
          title={editingClient ? 'Edit Client' : 'Add New Client'}
          size="xl"
        >
          <ClientOnboardingWizard
            onComplete={handleOnboardingComplete}
            onCancel={handleOnboardingCancel}
            initialData={editingClient || undefined}
          />
        </Modal>
      )}

      {/* Client Profile Modal */}
      {showProfile && selectedClient && (
        <Modal
          open={showProfile}
          onOpenChange={(open) => {
            if (!open) {
              setShowProfile(false);
              setSelectedClient(null);
              selectClient(null);
            }
          }}
          title={`${selectedClient.name} Profile`}
          size="xl"
        >
          <ClientProfile
            client={selectedClient}
            onEdit={handleProfileEdit}
            onDelete={handleProfileDelete}
            onStartKeywordResearch={handleProfileStartKeywordResearch}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          open={!!showDeleteConfirm}
          onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
          title="Delete Client"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? 
              This action cannot be undone and will remove all associated data including:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Client contacts and information</li>
              <li>• Competitor analysis data</li>
              <li>• Website crawl insights</li>
              <li>• Keyword research projects</li>
              <li>• All related tasks and strategies</li>
            </ul>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteClient}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Client
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Clients;