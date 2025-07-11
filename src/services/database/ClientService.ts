import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Client } from '../../types';
import { Database } from '../../types/database';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export class ClientService {
  // Transform database row to application type
  private transformClient(row: ClientRow): Client {
    return {
      id: row.id,
      name: row.name,
      industry: row.industry,
      type: row.type,
      status: row.status,
      websiteUrl: row.website_url,
      createdAt: new Date(row.created_at),
    };
  }

  // Get all clients
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      handleSupabaseError(error);
      
      return data ? data.map(this.transformClient) : [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // Get client by ID
  async getClient(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      handleSupabaseError(error);
      
      return data ? this.transformClient(data) : null;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  // Create new client
  async createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    try {
      const clientData: ClientInsert = {
        name: client.name,
        industry: client.industry,
        type: client.type,
        status: client.status,
        website_url: client.websiteUrl,
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      handleSupabaseError(error);
      
      if (!data) {
        throw new Error('Failed to create client');
      }

      return this.transformClient(data);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Update client
  async updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client> {
    try {
      const clientData: ClientUpdate = {};
      
      if (updates.name !== undefined) clientData.name = updates.name;
      if (updates.industry !== undefined) clientData.industry = updates.industry;
      if (updates.type !== undefined) clientData.type = updates.type;
      if (updates.status !== undefined) clientData.status = updates.status;
      if (updates.websiteUrl !== undefined) clientData.website_url = updates.websiteUrl;

      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      handleSupabaseError(error);
      
      if (!data) {
        throw new Error('Failed to update client');
      }

      return this.transformClient(data);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Delete client
  async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      handleSupabaseError(error);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Subscribe to client changes
  subscribeToClients(callback: (clients: Client[]) => void) {
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        async () => {
          // Fetch updated clients when changes occur
          const clients = await this.getClients();
          callback(clients);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export default new ClientService();