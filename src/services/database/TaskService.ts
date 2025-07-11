import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Task, TaskType, TaskStatus } from '../../types';
import { Database } from '../../types/database';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export class TaskService {
  // Transform database row to application type
  private transformTask(row: TaskRow): Task {
    return {
      id: row.id,
      clientId: row.client_id,
      type: row.type as TaskType,
      status: row.status as TaskStatus,
      progress: row.progress,
      priority: row.priority,
      assignedTo: row.assigned_to || undefined,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      handleSupabaseError(error);
      
      return data ? data.map(this.transformTask) : [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get tasks by client ID
  async getTasksByClient(clientId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      handleSupabaseError(error);
      
      return data ? data.map(this.transformTask) : [];
    } catch (error) {
      console.error('Error fetching tasks by client:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTask(id: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      handleSupabaseError(error);
      
      return data ? this.transformTask(data) : null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Create new task
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const taskData: TaskInsert = {
        client_id: task.clientId,
        type: task.type,
        status: task.status,
        progress: task.progress,
        priority: task.priority,
        assigned_to: task.assignedTo,
        due_date: task.dueDate?.toISOString(),
        metadata: task.metadata,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      handleSupabaseError(error);
      
      if (!data) {
        throw new Error('Failed to create task');
      }

      return this.transformTask(data);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update task
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
    try {
      const taskData: TaskUpdate = {};
      
      if (updates.clientId !== undefined) taskData.client_id = updates.clientId;
      if (updates.type !== undefined) taskData.type = updates.type;
      if (updates.status !== undefined) taskData.status = updates.status;
      if (updates.progress !== undefined) taskData.progress = updates.progress;
      if (updates.priority !== undefined) taskData.priority = updates.priority;
      if (updates.assignedTo !== undefined) taskData.assigned_to = updates.assignedTo;
      if (updates.dueDate !== undefined) taskData.due_date = updates.dueDate?.toISOString();
      if (updates.metadata !== undefined) taskData.metadata = updates.metadata;

      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select()
        .single();

      handleSupabaseError(error);
      
      if (!data) {
        throw new Error('Failed to update task');
      }

      return this.transformTask(data);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      handleSupabaseError(error);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get task statistics
  async getTaskStatistics() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, priority, type');

      handleSupabaseError(error);
      
      if (!data) return null;

      const stats = {
        total: data.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        byType: {} as Record<string, number>,
      };

      data.forEach(task => {
        stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
        stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
        stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      throw error;
    }
  }

  // Subscribe to task changes
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        async () => {
          // Fetch updated tasks when changes occur
          const tasks = await this.getTasks();
          callback(tasks);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export default new TaskService();