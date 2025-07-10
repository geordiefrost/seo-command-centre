import { create } from 'zustand';
import { Integration, IntegrationStatus } from '../types';

interface IntegrationState {
  integrations: Integration[];
  integrationStatuses: Record<string, IntegrationStatus>;
  isConnecting: Record<string, boolean>;
  lastSyncTimes: Record<string, Date>;
  
  // Actions
  setIntegrations: (integrations: Integration[]) => void;
  updateIntegration: (integrationId: string, updates: Partial<Integration>) => void;
  setIntegrationStatus: (service: string, status: IntegrationStatus) => void;
  setConnecting: (service: string, connecting: boolean) => void;
  connectIntegration: (service: string, config: any) => Promise<void>;
  disconnectIntegration: (service: string) => void;
  syncIntegration: (service: string) => Promise<void>;
  getIntegrationStatus: (service: string) => IntegrationStatus | undefined;
  getConnectedIntegrations: () => Integration[];
  getDisconnectedIntegrations: () => Integration[];
  hasIntegrationError: (service: string) => boolean;
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  // Initial state
  integrations: [],
  integrationStatuses: {},
  isConnecting: {},
  lastSyncTimes: {},
  
  // Actions
  setIntegrations: (integrations) => set({ integrations }),
  
  updateIntegration: (integrationId, updates) => {
    const { integrations } = get();
    const updatedIntegrations = integrations.map(integration =>
      integration.id === integrationId ? { ...integration, ...updates } : integration
    );
    set({ integrations: updatedIntegrations });
  },
  
  setIntegrationStatus: (service, status) => {
    const { integrationStatuses } = get();
    set({
      integrationStatuses: {
        ...integrationStatuses,
        [service]: status
      }
    });
  },
  
  setConnecting: (service, connecting) => {
    const { isConnecting } = get();
    set({
      isConnecting: {
        ...isConnecting,
        [service]: connecting
      }
    });
  },
  
  connectIntegration: async (service, config) => {
    const { setConnecting, setIntegrationStatus } = get();
    
    setConnecting(service, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      setIntegrationStatus(service, {
        service,
        connected: true,
        lastSync: new Date(),
        config
      });
      
      setConnecting(service, false);
    } catch (error) {
      setIntegrationStatus(service, {
        service,
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
      setConnecting(service, false);
      throw error;
    }
  },
  
  disconnectIntegration: (service) => {
    const { setIntegrationStatus } = get();
    setIntegrationStatus(service, {
      service,
      connected: false,
      lastSync: undefined,
      error: undefined
    });
  },
  
  syncIntegration: async (service) => {
    const { integrationStatuses, setIntegrationStatus, lastSyncTimes } = get();
    const currentStatus = integrationStatuses[service];
    
    if (!currentStatus?.connected) {
      throw new Error(`${service} is not connected`);
    }
    
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      setIntegrationStatus(service, {
        ...currentStatus,
        lastSync: now,
        error: undefined
      });
      
      set({
        lastSyncTimes: {
          ...lastSyncTimes,
          [service]: now
        }
      });
    } catch (error) {
      setIntegrationStatus(service, {
        ...currentStatus,
        error: error instanceof Error ? error.message : 'Sync failed'
      });
      throw error;
    }
  },
  
  getIntegrationStatus: (service) => {
    const { integrationStatuses } = get();
    return integrationStatuses[service];
  },
  
  getConnectedIntegrations: () => {
    const { integrations, integrationStatuses } = get();
    return integrations.filter(integration => 
      integrationStatuses[integration.name]?.connected
    );
  },
  
  getDisconnectedIntegrations: () => {
    const { integrations, integrationStatuses } = get();
    return integrations.filter(integration => 
      !integrationStatuses[integration.name]?.connected
    );
  },
  
  hasIntegrationError: (service) => {
    const { integrationStatuses } = get();
    return !!integrationStatuses[service]?.error;
  },
}));