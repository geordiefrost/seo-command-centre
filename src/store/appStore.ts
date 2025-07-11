import { create } from 'zustand';
import { Client, Task, TaskFilters, User, UserRole, Notification } from '../types';
import { ClientService, TaskService } from '../services/database';

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Clients
  clients: Client[];
  selectedClientId: string | null;
  
  // Tasks
  tasks: Task[];
  taskFilters: TaskFilters;
  
  // UI State
  sidebarCollapsed: boolean;
  activeModal: string | null;
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  removeClient: (clientId: string) => void;
  selectClient: (clientId: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setTaskFilters: (filters: TaskFilters) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
  
  // Database operations
  loadClients: () => Promise<void>;
  loadTasks: () => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTaskInDB: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  clients: [],
  selectedClientId: null,
  tasks: [],
  taskFilters: {},
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],
  isLoading: false,
  loadingMessage: '',
  
  // Actions
  setUser: (user) => set({ user }),
  
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  
  setClients: (clients) => set({ clients }),
  
  addClient: (client) => {
    const { clients } = get();
    set({ clients: [...clients, client] });
  },
  
  updateClient: (clientId, updates) => {
    const { clients } = get();
    const updatedClients = clients.map(client =>
      client.id === clientId ? { ...client, ...updates } : client
    );
    set({ clients: updatedClients });
  },
  
  removeClient: (clientId) => {
    const { clients } = get();
    set({ clients: clients.filter(client => client.id !== clientId) });
  },
  
  selectClient: (clientId) => set({ selectedClientId: clientId }),
  
  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (taskId, updates) => {
    const { tasks } = get();
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    set({ tasks: updatedTasks });
  },
  
  addTask: (task) => {
    const { tasks } = get();
    set({ tasks: [...tasks, task] });
  },
  
  removeTask: (taskId) => {
    const { tasks } = get();
    set({ tasks: tasks.filter(task => task.id !== taskId) });
  },
  
  setTaskFilters: (filters) => set({ taskFilters: filters }),
  
  toggleSidebar: () => {
    const { sidebarCollapsed } = get();
    set({ sidebarCollapsed: !sidebarCollapsed });
  },
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setActiveModal: (modal) => set({ activeModal: modal }),
  
  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    set({ notifications: [newNotification, ...notifications] });
  },
  
  removeNotification: (id) => {
    const { notifications } = get();
    set({ notifications: notifications.filter(n => n.id !== id) });
  },
  
  markNotificationAsRead: (id) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
  },
  
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
  
  // Database operations
  loadClients: async () => {
    try {
      set({ isLoading: true, loadingMessage: 'Loading clients...' });
      const clients = await ClientService.getClients();
      set({ clients });
    } catch (error) {
      console.error('Failed to load clients:', error);
      get().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load clients',
        timestamp: new Date(),
        read: false,
      });
    } finally {
      set({ isLoading: false, loadingMessage: '' });
    }
  },
  
  loadTasks: async () => {
    try {
      set({ isLoading: true, loadingMessage: 'Loading tasks...' });
      const tasks = await TaskService.getTasks();
      set({ tasks });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      get().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load tasks',
        timestamp: new Date(),
        read: false,
      });
    } finally {
      set({ isLoading: false, loadingMessage: '' });
    }
  },
  
  createClient: async (clientData) => {
    try {
      set({ isLoading: true, loadingMessage: 'Creating client...' });
      const newClient = await ClientService.createClient(clientData);
      const { clients } = get();
      set({ clients: [...clients, newClient] });
      get().addNotification({
        type: 'success',
        title: 'Success',
        message: 'Client created successfully',
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Failed to create client:', error);
      get().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create client',
        timestamp: new Date(),
        read: false,
      });
    } finally {
      set({ isLoading: false, loadingMessage: '' });
    }
  },
  
  createTask: async (taskData) => {
    try {
      set({ isLoading: true, loadingMessage: 'Creating task...' });
      const newTask = await TaskService.createTask(taskData);
      const { tasks } = get();
      set({ tasks: [newTask, ...tasks] });
      get().addNotification({
        type: 'success',
        title: 'Success',
        message: 'Task created successfully',
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      get().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create task',
        timestamp: new Date(),
        read: false,
      });
    } finally {
      set({ isLoading: false, loadingMessage: '' });
    }
  },
  
  updateTaskInDB: async (taskId, updates) => {
    try {
      const updatedTask = await TaskService.updateTask(taskId, updates);
      const { tasks } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? updatedTask : task
      );
      set({ tasks: updatedTasks });
    } catch (error) {
      console.error('Failed to update task:', error);
      get().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update task',
        timestamp: new Date(),
        read: false,
      });
    }
  },
  
  deleteTask: async (taskId) => {
    try {
      await TaskService.deleteTask(taskId);
      const { tasks } = get();
      set({ tasks: tasks.filter(task => task.id !== taskId) });
      get().addNotification({
        type: 'success',
        title: 'Success',
        message: 'Task deleted successfully',
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      get().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete task',
        timestamp: new Date(),
        read: false,
      });
    }
  },
}));