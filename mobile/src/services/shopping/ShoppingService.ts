import { Platform } from 'react-native';
import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  addedBy: string;
  addedAt: number;
  completedBy?: string;
  completedAt?: number;
  notes?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  store?: string;
  isShared: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  items: ShoppingItem[];
  totalItems: number;
  completedItems: number;
  estimatedTotal: number;
  actualTotal: number;
  isShared: boolean;
  sharedWith: string[];
  status: 'active' | 'completed' | 'archived';
}

interface ShoppingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
}

interface ShoppingStore {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  distance?: number;
  isFavorite: boolean;
}

interface ShoppingBudget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate: number;
  categories: string[];
}

export class ShoppingService {
  private static instance: ShoppingService;
  private shoppingLists: ShoppingList[] = [];
  private categories: ShoppingCategory[] = [];
  private stores: ShoppingStore[] = [];
  private budgets: ShoppingBudget[] = [];

  private constructor() {}

  static getInstance(): ShoppingService {
    if (!ShoppingService.instance) {
      ShoppingService.instance = new ShoppingService();
    }
    return ShoppingService.instance;
  }

  // Initialize shopping service
  async initialize(): Promise<void> {
    try {
      // Load shopping data
      await this.loadShoppingLists();
      await this.loadCategories();
      await this.loadStores();
      await this.loadBudgets();
      
      console.log('Shopping service initialized');
    } catch (error) {
      console.error('Failed to initialize shopping service:', error);
      throw error;
    }
  }

  // Load shopping lists
  private async loadShoppingLists(): Promise<void> {
    try {
      const response = await apiClient.get('/shopping/lists');
      this.shoppingLists = response.data;
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
      this.shoppingLists = [];
    }
  }

  // Load categories
  private async loadCategories(): Promise<void> {
    try {
      const response = await apiClient.get('/shopping/categories');
      this.categories = response.data;
    } catch (error) {
      console.error('Failed to load categories:', error);
      this.categories = this.getDefaultCategories();
    }
  }

  // Load stores
  private async loadStores(): Promise<void> {
    try {
      const response = await apiClient.get('/shopping/stores');
      this.stores = response.data;
    } catch (error) {
      console.error('Failed to load stores:', error);
      this.stores = [];
    }
  }

  // Load budgets
  private async loadBudgets(): Promise<void> {
    try {
      const response = await apiClient.get('/shopping/budgets');
      this.budgets = response.data;
    } catch (error) {
      console.error('Failed to load budgets:', error);
      this.budgets = [];
    }
  }

  // Get default categories
  private getDefaultCategories(): ShoppingCategory[] {
    return [
      { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#4CAF50', itemCount: 0 },
      { id: 'household', name: 'Household', icon: 'home', color: '#2196F3', itemCount: 0 },
      { id: 'electronics', name: 'Electronics', icon: 'cellphone', color: '#FF9800', itemCount: 0 },
      { id: 'clothing', name: 'Clothing', icon: 'tshirt-crew', color: '#9C27B0', itemCount: 0 },
      { id: 'health', name: 'Health & Beauty', icon: 'medical-bag', color: '#F44336', itemCount: 0 },
      { id: 'books', name: 'Books', icon: 'book-open-variant', color: '#795548', itemCount: 0 },
      { id: 'toys', name: 'Toys & Games', icon: 'gamepad-variant', color: '#E91E63', itemCount: 0 },
      { id: 'automotive', name: 'Automotive', icon: 'car', color: '#607D8B', itemCount: 0 },
      { id: 'sports', name: 'Sports & Outdoors', icon: 'soccer', color: '#4CAF50', itemCount: 0 },
      { id: 'other', name: 'Other', icon: 'package-variant', color: '#9E9E9E', itemCount: 0 },
    ];
  }

  // Create shopping list
  async createShoppingList(name: string, description?: string, sharedWith: string[] = []): Promise<ShoppingList> {
    try {
      const shoppingList: ShoppingList = {
        id: this.generateId(),
        name,
        description,
        createdBy: 'current-user', // This would be the actual user ID
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
        totalItems: 0,
        completedItems: 0,
        estimatedTotal: 0,
        actualTotal: 0,
        isShared: sharedWith.length > 0,
        sharedWith,
        status: 'active',
      };

      const response = await apiClient.post('/shopping/lists', shoppingList);
      const createdList = response.data;

      this.shoppingLists.push(createdList);

      // Track list creation
      analyticsService.trackEvent('shopping_list_created', {
        listName: name,
        isShared: shoppingList.isShared,
        sharedCount: sharedWith.length,
      });

      console.log(`Shopping list created: ${name}`);
      return createdList;
    } catch (error) {
      console.error('Failed to create shopping list:', error);
      throw error;
    }
  }

  // Get shopping lists
  getShoppingLists(): ShoppingList[] {
    return [...this.shoppingLists];
  }

  // Get shopping list by ID
  getShoppingListById(listId: string): ShoppingList | null {
    return this.shoppingLists.find(list => list.id === listId) || null;
  }

  // Add item to shopping list
  async addItemToList(listId: string, item: Omit<ShoppingItem, 'id' | 'addedAt' | 'isShared'>): Promise<ShoppingItem> {
    try {
      const shoppingItem: ShoppingItem = {
        ...item,
        id: this.generateId(),
        addedAt: Date.now(),
        isShared: false,
      };

      const response = await apiClient.post(`/shopping/lists/${listId}/items`, shoppingItem);
      const createdItem = response.data;

      // Update local list
      const list = this.getShoppingListById(listId);
      if (list) {
        list.items.push(createdItem);
        list.totalItems = list.items.length;
        list.updatedAt = Date.now();
      }

      // Track item addition
      analyticsService.trackEvent('shopping_item_added', {
        listId,
        itemName: item.name,
        category: item.category,
        priority: item.priority,
      });

      console.log(`Item added to list: ${item.name}`);
      return createdItem;
    } catch (error) {
      console.error('Failed to add item to list:', error);
      throw error;
    }
  }

  // Update shopping item
  async updateItem(listId: string, itemId: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
    try {
      const response = await apiClient.put(`/shopping/lists/${listId}/items/${itemId}`, updates);
      const updatedItem = response.data;

      // Update local item
      const list = this.getShoppingListById(listId);
      if (list) {
        const itemIndex = list.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          list.items[itemIndex] = updatedItem;
          list.updatedAt = Date.now();
        }
      }

      console.log(`Item updated: ${updatedItem.name}`);
      return updatedItem;
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  }

  // Remove item from shopping list
  async removeItemFromList(listId: string, itemId: string): Promise<void> {
    try {
      await apiClient.delete(`/shopping/lists/${listId}/items/${itemId}`);

      // Update local list
      const list = this.getShoppingListById(listId);
      if (list) {
        list.items = list.items.filter(item => item.id !== itemId);
        list.totalItems = list.items.length;
        list.updatedAt = Date.now();
      }

      console.log('Item removed from list');
    } catch (error) {
      console.error('Failed to remove item from list:', error);
      throw error;
    }
  }

  // Mark item as completed
  async completeItem(listId: string, itemId: string, completedBy: string, actualPrice?: number): Promise<void> {
    try {
      const updates: Partial<ShoppingItem> = {
        completedBy,
        completedAt: Date.now(),
        actualPrice,
      };

      await this.updateItem(listId, itemId, updates);

      // Update list statistics
      const list = this.getShoppingListById(listId);
      if (list) {
        list.completedItems = list.items.filter(item => item.completedAt).length;
        list.actualTotal = list.items.reduce((sum, item) => sum + (item.actualPrice || 0), 0);
      }

      // Track item completion
      analyticsService.trackEvent('shopping_item_completed', {
        listId,
        itemId,
        actualPrice,
      });

      console.log('Item marked as completed');
    } catch (error) {
      console.error('Failed to complete item:', error);
      throw error;
    }
  }

  // Get categories
  getCategories(): ShoppingCategory[] {
    return [...this.categories];
  }

  // Get category by ID
  getCategoryById(categoryId: string): ShoppingCategory | null {
    return this.categories.find(category => category.id === categoryId) || null;
  }

  // Get stores
  getStores(): ShoppingStore[] {
    return [...this.stores];
  }

  // Get store by ID
  getStoreById(storeId: string): ShoppingStore | null {
    return this.stores.find(store => store.id === storeId) || null;
  }

  // Add store to favorites
  async addStoreToFavorites(storeId: string): Promise<void> {
    try {
      await apiClient.post(`/shopping/stores/${storeId}/favorite`);
      
      // Update local store
      const store = this.getStoreById(storeId);
      if (store) {
        store.isFavorite = true;
      }

      console.log('Store added to favorites');
    } catch (error) {
      console.error('Failed to add store to favorites:', error);
      throw error;
    }
  }

  // Remove store from favorites
  async removeStoreFromFavorites(storeId: string): Promise<void> {
    try {
      await apiClient.delete(`/shopping/stores/${storeId}/favorite`);
      
      // Update local store
      const store = this.getStoreById(storeId);
      if (store) {
        store.isFavorite = false;
      }

      console.log('Store removed from favorites');
    } catch (error) {
      console.error('Failed to remove store from favorites:', error);
      throw error;
    }
  }

  // Get budgets
  getBudgets(): ShoppingBudget[] {
    return [...this.budgets];
  }

  // Get budget by ID
  getBudgetById(budgetId: string): ShoppingBudget | null {
    return this.budgets.find(budget => budget.id === budgetId) || null;
  }

  // Create budget
  async createBudget(budget: Omit<ShoppingBudget, 'id' | 'spent' | 'remaining'>): Promise<ShoppingBudget> {
    try {
      const newBudget: ShoppingBudget = {
        ...budget,
        id: this.generateId(),
        spent: 0,
        remaining: budget.amount,
      };

      const response = await apiClient.post('/shopping/budgets', newBudget);
      const createdBudget = response.data;

      this.budgets.push(createdBudget);

      console.log(`Budget created: ${budget.name}`);
      return createdBudget;
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  }

  // Update budget spending
  async updateBudgetSpending(budgetId: string, amount: number): Promise<void> {
    try {
      const budget = this.getBudgetById(budgetId);
      if (budget) {
        budget.spent += amount;
        budget.remaining = budget.amount - budget.spent;

        await apiClient.put(`/shopping/budgets/${budgetId}/spending`, { amount });

        console.log(`Budget spending updated: ${amount}`);
      }
    } catch (error) {
      console.error('Failed to update budget spending:', error);
      throw error;
    }
  }

  // Get shopping statistics
  async getShoppingStatistics(): Promise<any> {
    try {
      const response = await apiClient.get('/shopping/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to get shopping statistics:', error);
      return {
        totalLists: this.shoppingLists.length,
        totalItems: this.shoppingLists.reduce((sum, list) => sum + list.totalItems, 0),
        completedItems: this.shoppingLists.reduce((sum, list) => sum + list.completedItems, 0),
        totalSpent: this.shoppingLists.reduce((sum, list) => sum + list.actualTotal, 0),
        averageListSize: this.shoppingLists.length > 0 ? 
          this.shoppingLists.reduce((sum, list) => sum + list.totalItems, 0) / this.shoppingLists.length : 0,
      };
    }
  }

  // Search items
  searchItems(query: string): ShoppingItem[] {
    const lowerQuery = query.toLowerCase();
    const allItems: ShoppingItem[] = [];
    
    this.shoppingLists.forEach(list => {
      allItems.push(...list.items);
    });

    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  // Get items by category
  getItemsByCategory(categoryId: string): ShoppingItem[] {
    const allItems: ShoppingItem[] = [];
    
    this.shoppingLists.forEach(list => {
      allItems.push(...list.items.filter(item => item.category === categoryId));
    });

    return allItems;
  }

  // Get items by priority
  getItemsByPriority(priority: string): ShoppingItem[] {
    const allItems: ShoppingItem[] = [];
    
    this.shoppingLists.forEach(list => {
      allItems.push(...list.items.filter(item => item.priority === priority));
    });

    return allItems;
  }

  // Get urgent items
  getUrgentItems(): ShoppingItem[] {
    return this.getItemsByPriority('urgent');
  }

  // Get completed items
  getCompletedItems(): ShoppingItem[] {
    const allItems: ShoppingItem[] = [];
    
    this.shoppingLists.forEach(list => {
      allItems.push(...list.items.filter(item => item.completedAt));
    });

    return allItems;
  }

  // Get pending items
  getPendingItems(): ShoppingItem[] {
    const allItems: ShoppingItem[] = [];
    
    this.shoppingLists.forEach(list => {
      allItems.push(...list.items.filter(item => !item.completedAt));
    });

    return allItems;
  }

  // Share shopping list
  async shareShoppingList(listId: string, userIds: string[]): Promise<void> {
    try {
      await apiClient.post(`/shopping/lists/${listId}/share`, { userIds });
      
      // Update local list
      const list = this.getShoppingListById(listId);
      if (list) {
        list.sharedWith = [...list.sharedWith, ...userIds];
        list.isShared = true;
      }

      console.log('Shopping list shared');
    } catch (error) {
      console.error('Failed to share shopping list:', error);
      throw error;
    }
  }

  // Generate ID
  private generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `shopping_${timestamp}_${random}`;
  }
}

export const shoppingService = ShoppingService.getInstance();
export default shoppingService; 