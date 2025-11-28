import { User, Order, OrderStatus, Product } from '../types';
import { MOCK_USERS, INITIAL_ORDERS } from '../constants';

const NETWORK_DELAY = 600;

class MockDatabaseService {
  private STORAGE_KEYS = {
    USERS: 'autoreturn_sqlite_users_v3',
    ORDERS: 'autoreturn_sqlite_orders_v3',
    SESSION: 'autoreturn_session_id'
  };

  private inMemoryUsers: User[] | null = null;
  private inMemoryOrders: Order[] | null = null;
  private useLocalStorage: boolean = true;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
        const testKey = '__db_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        this.useLocalStorage = true;
    } catch (e) {
        this.useLocalStorage = false;
        this.inMemoryUsers = [...MOCK_USERS];
        this.inMemoryOrders = [...INITIAL_ORDERS];
        return;
    }

    try {
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            // Ensure mock users have wishlist array init
            const users = MOCK_USERS.map(u => ({ ...u, wishlist: u.wishlist || [] }));
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        }
    } catch (e) {
        this.useLocalStorage = false;
        this.inMemoryUsers = [...MOCK_USERS];
        this.inMemoryOrders = [...INITIAL_ORDERS];
    }
  }

  private getUsers(): User[] {
    if (!this.useLocalStorage) return this.inMemoryUsers || [...MOCK_USERS];
    try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '[]');
    } catch {
        return [...MOCK_USERS];
    }
  }

  private saveUsers(users: User[]) {
    if (!this.useLocalStorage) {
        this.inMemoryUsers = users;
        return;
    }
    try {
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {}
  }

  private getOrders(): Order[] {
    if (!this.useLocalStorage) return this.inMemoryOrders || [...INITIAL_ORDERS];
    try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS) || '[]');
    } catch {
        return [...INITIAL_ORDERS];
    }
  }

  private saveOrders(orders: Order[]) {
    if (!this.useLocalStorage) {
        this.inMemoryOrders = orders;
        return;
    }
    try {
        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {}
  }

  // --- Session Management ---

  async restoreSession(): Promise<User | null> {
      if (!this.useLocalStorage) return null;
      try {
          const userId = localStorage.getItem(this.STORAGE_KEYS.SESSION);
          if (!userId) return null;
          
          // Fast check without artificial network delay for better UX on load
          const users = this.getUsers();
          return users.find(u => u.id === userId) || null;
      } catch { return null; }
  }

  setSession(userId: string) {
      if (this.useLocalStorage) {
          localStorage.setItem(this.STORAGE_KEYS.SESSION, userId);
      }
  }

  clearSession() {
      if (this.useLocalStorage) {
          localStorage.removeItem(this.STORAGE_KEYS.SESSION);
      }
  }

  // --- Auth & Data Methods ---

  async login(email: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
        await new Promise(r => setTimeout(r, NETWORK_DELAY));
        const users = this.getUsers();
        // Trim inputs and use case-insensitive email check
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();
        
        const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === cleanPass);
        if (user) return { user: { ...user, wishlist: user.wishlist || [] } };
        return { error: "Incorrect username or password" };
    } catch (e) {
        return { error: "Internal Server Error" };
    }
  }

  async register(email: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
        await new Promise(r => setTimeout(r, NETWORK_DELAY));
        const users = this.getUsers();
        const cleanEmail = email.trim().toLowerCase();
        
        if (users.find(u => u.email.toLowerCase() === cleanEmail)) return { error: "User already exists" };

        const newUser: User = {
          id: `usr_${Date.now()}`,
          email: email.trim(), // Save original casing for display
          name: email.split('@')[0],
          passwordHash: password.trim(),
          preferences: [],
          wishlist: []
        };
        users.push(newUser);
        this.saveUsers(users); // PERSIST TO "SQL" (localStorage)
        return { user: newUser };
    } catch (e) {
        return { error: "Database Write Error" };
    }
  }

  async verifyEmail(email: string): Promise<boolean> {
      await new Promise(r => setTimeout(r, NETWORK_DELAY));
      const users = this.getUsers();
      return !!users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
      try {
          await new Promise(r => setTimeout(r, NETWORK_DELAY));
          const users = this.getUsers();
          const cleanEmail = email.trim().toLowerCase();
          const idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
          
          if (idx !== -1) {
              users[idx].passwordHash = newPassword.trim();
              this.saveUsers(users);
              return true;
          }
          return false;
      } catch (e) {
          return false;
      }
  }

  async toggleWishlist(userId: string, productId: string): Promise<string[]> {
      try {
          const users = this.getUsers();
          const idx = users.findIndex(u => u.id === userId);
          if (idx === -1) return [];

          const wishlist = users[idx].wishlist || [];
          const exists = wishlist.includes(productId);
          
          let newWishlist;
          if (exists) {
              newWishlist = wishlist.filter(id => id !== productId);
          } else {
              newWishlist = [...wishlist, productId];
          }
          
          users[idx].wishlist = newWishlist;
          this.saveUsers(users);
          return newWishlist;
      } catch (e) {
          return [];
      }
  }

  async fetchUserOrders(userId: string): Promise<Order[]> {
    try {
        await new Promise(r => setTimeout(r, 400));
        const allOrders = this.getOrders();
        return allOrders.filter(o => o.userId === userId);
    } catch (e) { return []; }
  }

  async createOrder(userId: string, items: Product[]): Promise<Order> {
      await new Promise(r => setTimeout(r, 800));
      const orders = this.getOrders();
      const users = this.getUsers();
      const user = users.find(u => u.id === userId);
      
      const newOrder: Order = {
          orderId: `ORD-${Math.floor(Math.random() * 10000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          userId: userId,
          customerName: user ? user.name : 'Guest',
          date: new Date().toISOString().split('T')[0],
          status: OrderStatus.DELIVERED, // Auto-deliver for demo purposes so they can return immediately
          items: items,
          eligibleForReturn: true
      };
      
      orders.push(newOrder);
      this.saveOrders(orders);
      return newOrder;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
      try {
          await new Promise(r => setTimeout(r, 600));
          const orders = this.getOrders();
          const idx = orders.findIndex(o => o.orderId === orderId);
          if (idx !== -1) {
              orders[idx].status = status;
              this.saveOrders(orders);
              return true;
          }
          return false;
      } catch (e) { return false; }
  }
}

export const db = new MockDatabaseService();