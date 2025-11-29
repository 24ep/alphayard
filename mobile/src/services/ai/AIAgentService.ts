import { apiClient } from '../api/apiClient';
import { familyService } from '../hourse/FamilyService';
import { userService } from '../user/UserService';
import { chatService } from '../chat/ChatService';
import { locationService } from '../location/LocationService';
import { safetyService } from '../safety/SafetyService';
import { notificationService } from '../notification/NotificationService';
import { storageService } from '../storage/StorageService';
import { analyticsService } from '../analytics/AnalyticsService';
import { encryptionService } from '../encryption/EncryptionService';
import { backupService } from '../backup/BackupService';
import { healthService } from '../health/HealthService';
import { expenseService } from '../expenses/ExpenseService';
import { shoppingService } from '../shopping/ShoppingService';
import { noteService } from '../notes/NoteService';
import { gameService } from '../gaming/GameService';
import { weatherService } from '../weather/WeatherService';
import { newsService } from '../news/NewsService';
import { entertainmentService } from '../entertainment/EntertainmentService';

export interface AIAgentContext {
  userId: string;
  familyId: string;
  userRole: 'admin' | 'member' | 'child';
  permissions: string[];
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo: {
    platform: string;
    version: string;
  };
}

export interface AIAgentRequest {
  message: string;
  context: AIAgentContext;
  intent?: string;
  entities?: {
    action?: string;
    target?: string;
    parameters?: any;
  };
}

export interface AIAgentResponse {
  message: string;
  actions: AIAgentAction[];
  suggestions: string[];
  data?: any;
  confidence: number;
}

export interface AIAgentAction {
  type: 'create' | 'update' | 'delete' | 'read' | 'notify' | 'navigate';
  service: string;
  method: string;
  parameters: any;
  description: string;
}

export interface AIAgentCapability {
  service: string;
  methods: string[];
  description: string;
  examples: string[];
}

export interface AIAgentMemory {
  conversationId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    actions?: AIAgentAction[];
  }>;
  context: any;
  createdAt: number;
  updatedAt: number;
}

class AIAgentService {
  private memory: Map<string, AIAgentMemory> = new Map();
  private capabilities: AIAgentCapability[] = [
    {
      service: 'hourse',
      methods: ['getFamily', 'updateFamily', 'addMember', 'removeMember', 'inviteMember', 'updateMemberRole'],
      description: 'Manage hourse information, members, and roles',
      examples: [
        'Add a new hourse member',
        'Change member role to admin',
        'Invite someone to join the hourse',
        'Remove a hourse member'
      ]
    },
    {
      service: 'user',
      methods: ['getUser', 'updateUser', 'updateProfile', 'updatePreferences', 'getUserStats'],
      description: 'Manage user profiles and preferences',
      examples: [
        'Update my profile picture',
        'Change my notification settings',
        'Update my emergency contacts',
        'View my activity stats'
      ]
    },
    {
      service: 'chat',
      methods: ['sendMessage', 'getChatHistory', 'createChat', 'deleteChat', 'muteChat', 'pinChat'],
      description: 'Manage hourse chat and messaging',
      examples: [
        'Send a message to the hourse group',
        'Create a new chat with specific members',
        'Mute notifications for a chat',
        'View chat history'
      ]
    },
    {
      service: 'location',
      methods: ['getLocation', 'shareLocation', 'getLocationHistory', 'createGeofence', 'updateGeofence'],
      description: 'Manage location tracking and geofences',
      examples: [
        'Share my current location',
        'Create a geofence around home',
        'View location history',
        'Set up location alerts'
      ]
    },
    {
      service: 'safety',
      methods: ['sendEmergencyAlert', 'addEmergencyContact', 'checkIn', 'getSafetyStatus', 'createGeofence'],
      description: 'Manage safety features and emergency contacts',
      examples: [
        'Send an emergency alert',
        'Add a new emergency contact',
        'Check in to let hourse know I\'m safe',
        'View safety status'
      ]
    },
    {
      service: 'notification',
      methods: ['sendNotification', 'updateNotificationSettings', 'getNotificationHistory'],
      description: 'Manage notifications and alerts',
      examples: [
        'Send a notification to hourse members',
        'Update notification preferences',
        'View notification history'
      ]
    },
    {
      service: 'storage',
      methods: ['uploadFile', 'downloadFile', 'deleteFile', 'shareFile', 'getFileList'],
      description: 'Manage file storage and sharing',
      examples: [
        'Upload a hourse photo',
        'Share a document with hourse',
        'Delete old files',
        'View shared files'
      ]
    },
    {
      service: 'health',
      methods: ['addHealthRecord', 'updateHealthRecord', 'getHealthHistory', 'setHealthGoal'],
      description: 'Manage health tracking and records',
      examples: [
        'Add a health record',
        'Update medication schedule',
        'Set a fitness goal',
        'View health history'
      ]
    },
    {
      service: 'expenses',
      methods: ['addExpense', 'updateExpense', 'deleteExpense', 'getExpenseReport', 'setBudget'],
      description: 'Manage hourse expenses and budgets',
      examples: [
        'Add a new expense',
        'Update expense category',
        'View expense report',
        'Set monthly budget'
      ]
    },
    {
      service: 'shopping',
      methods: ['addShoppingItem', 'updateShoppingItem', 'deleteShoppingItem', 'getShoppingList', 'markAsPurchased'],
      description: 'Manage shopping lists and items',
      examples: [
        'Add item to shopping list',
        'Mark item as purchased',
        'Update item quantity',
        'View shopping list'
      ]
    },
    {
      service: 'notes',
      methods: ['createNote', 'updateNote', 'deleteNote', 'shareNote', 'getNotes'],
      description: 'Manage notes and documents',
      examples: [
        'Create a new note',
        'Update existing note',
        'Share note with hourse',
        'View all notes'
      ]
    },
    {
      service: 'games',
      methods: ['startGame', 'joinGame', 'getGameHistory', 'updateGameScore', 'getLeaderboard'],
      description: 'Manage hourse games and activities',
      examples: [
        'Start a hourse game',
        'Join an ongoing game',
        'View game history',
        'Check leaderboard'
      ]
    },
    {
      service: 'weather',
      methods: ['getCurrentWeather', 'getWeatherForecast', 'setWeatherAlerts'],
      description: 'Get weather information and alerts',
      examples: [
        'Get current weather',
        'Check weather forecast',
        'Set up weather alerts'
      ]
    },
    {
      service: 'news',
      methods: ['getNews', 'getLocalNews', 'setNewsPreferences'],
      description: 'Get news and updates',
      examples: [
        'Get latest news',
        'Get local news',
        'Update news preferences'
      ]
    },
    {
      service: 'entertainment',
      methods: ['addEntertainmentItem', 'updateEntertainmentItem', 'getEntertainmentList', 'rateItem'],
      description: 'Manage entertainment preferences and tracking',
      examples: [
        'Add a movie to watch list',
        'Rate a TV show',
        'Update entertainment preferences',
        'View entertainment list'
      ]
    }
  ];

  async processRequest(request: AIAgentRequest): Promise<AIAgentResponse> {
    try {
      // Analyze intent and entities
      const analysis = await this.analyzeIntent(request);
      
      // Get or create conversation memory
      const conversationId = this.getConversationId(request.context);
      const memory = this.getMemory(conversationId);
      
      // Add user message to memory
      memory.messages.push({
        role: 'user',
        content: request.message,
        timestamp: Date.now()
      });

      // Execute actions based on intent
      const actions = await this.executeActions(analysis, request.context);
      
      // Generate response
      const response = await this.generateResponse(analysis, actions, request.context);
      
      // Add assistant response to memory
      memory.messages.push({
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        actions: actions
      });
      
      // Update memory
      this.updateMemory(conversationId, memory);
      
      // Track analytics
      analyticsService.trackEvent('ai_agent_request', {
        intent: analysis.intent,
        confidence: analysis.confidence,
        actionsCount: actions.length,
        userId: request.context.userId
      });

      return response;
    } catch (error) {
      console.error('AI Agent error:', error);
      return {
        message: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        actions: [],
        suggestions: ['Try rephrasing your request', 'Check your permissions', 'Contact support'],
        confidence: 0
      };
    }
  }

  private async analyzeIntent(request: AIAgentRequest): Promise<{
    intent: string;
    entities: any;
    confidence: number;
    service: string;
    method: string;
    parameters: any;
  }> {
    // Simple intent analysis - in production, use NLP service
    const message = request.message.toLowerCase();
    
    // hourse management intents
    if (message.includes('add') && (message.includes('member') || message.includes('hourse'))) {
      return {
        intent: 'add_family_member',
        entities: { action: 'add', target: 'member' },
        confidence: 0.9,
        service: 'hourse',
        method: 'addMember',
        parameters: { email: this.extractEmail(message) }
      };
    }
    
    if (message.includes('remove') && (message.includes('member') || message.includes('hourse'))) {
      return {
        intent: 'remove_family_member',
        entities: { action: 'remove', target: 'member' },
        confidence: 0.9,
        service: 'hourse',
        method: 'removeMember',
        parameters: { memberId: this.extractMemberId(message) }
      };
    }
    
    if (message.includes('invite') && (message.includes('member') || message.includes('hourse'))) {
      return {
        intent: 'invite_family_member',
        entities: { action: 'invite', target: 'member' },
        confidence: 0.9,
        service: 'hourse',
        method: 'inviteMember',
        parameters: { email: this.extractEmail(message) }
      };
    }
    
    // Chat intents
    if (message.includes('send') && message.includes('message')) {
      return {
        intent: 'send_message',
        entities: { action: 'send', target: 'message' },
        confidence: 0.8,
        service: 'chat',
        method: 'sendMessage',
        parameters: { message: this.extractMessage(message) }
      };
    }
    
    // Safety intents
    if (message.includes('emergency') || message.includes('alert')) {
      return {
        intent: 'emergency_alert',
        entities: { action: 'send', target: 'emergency' },
        confidence: 0.95,
        service: 'safety',
        method: 'sendEmergencyAlert',
        parameters: {}
      };
    }
    
    if (message.includes('check in') || message.includes('checkin')) {
      return {
        intent: 'safety_check_in',
        entities: { action: 'check', target: 'in' },
        confidence: 0.9,
        service: 'safety',
        method: 'checkIn',
        parameters: {}
      };
    }
    
    // Location intents
    if (message.includes('location') || message.includes('where')) {
      return {
        intent: 'share_location',
        entities: { action: 'share', target: 'location' },
        confidence: 0.8,
        service: 'location',
        method: 'shareLocation',
        parameters: {}
      };
    }
    
    // Health intents
    if (message.includes('health') || message.includes('medical')) {
      return {
        intent: 'health_record',
        entities: { action: 'add', target: 'health' },
        confidence: 0.8,
        service: 'health',
        method: 'addHealthRecord',
        parameters: { type: this.extractHealthType(message) }
      };
    }
    
    // Expense intents
    if (message.includes('expense') || message.includes('spend') || message.includes('cost')) {
      return {
        intent: 'add_expense',
        entities: { action: 'add', target: 'expense' },
        confidence: 0.8,
        service: 'expenses',
        method: 'addExpense',
        parameters: { amount: this.extractAmount(message), category: this.extractCategory(message) }
      };
    }
    
    // Shopping intents
    if (message.includes('shopping') || message.includes('buy') || message.includes('purchase')) {
      return {
        intent: 'shopping_list',
        entities: { action: 'add', target: 'shopping' },
        confidence: 0.8,
        service: 'shopping',
        method: 'addShoppingItem',
        parameters: { item: this.extractItem(message) }
      };
    }
    
    // Notes intents
    if (message.includes('note') || message.includes('write') || message.includes('document')) {
      return {
        intent: 'create_note',
        entities: { action: 'create', target: 'note' },
        confidence: 0.8,
        service: 'notes',
        method: 'createNote',
        parameters: { content: this.extractContent(message) }
      };
    }
    
    // Default help intent
    return {
      intent: 'help',
      entities: { action: 'help', target: 'general' },
      confidence: 0.5,
      service: 'general',
      method: 'help',
      parameters: {}
    };
  }

  private async executeActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    try {
      switch (analysis.service) {
        case 'hourse':
          actions.push(...await this.executeFamilyActions(analysis, context));
          break;
        case 'chat':
          actions.push(...await this.executeChatActions(analysis, context));
          break;
        case 'safety':
          actions.push(...await this.executeSafetyActions(analysis, context));
          break;
        case 'location':
          actions.push(...await this.executeLocationActions(analysis, context));
          break;
        case 'health':
          actions.push(...await this.executeHealthActions(analysis, context));
          break;
        case 'expenses':
          actions.push(...await this.executeExpenseActions(analysis, context));
          break;
        case 'shopping':
          actions.push(...await this.executeShoppingActions(analysis, context));
          break;
        case 'notes':
          actions.push(...await this.executeNoteActions(analysis, context));
          break;
        default:
          actions.push({
            type: 'read',
            service: 'general',
            method: 'help',
            parameters: {},
            description: 'Show available capabilities'
          });
      }
    } catch (error) {
      console.error('Error executing actions:', error);
      actions.push({
        type: 'read',
        service: 'error',
        method: 'handleError',
        parameters: { error: error.message },
        description: 'Handle execution error'
      });
    }
    
    return actions;
  }

  private async executeFamilyActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'addMember':
        try {
          const result = await familyService.addMember(context.familyId, analysis.parameters);
          actions.push({
            type: 'create',
            service: 'hourse',
            method: 'addMember',
            parameters: analysis.parameters,
            description: `Added new hourse member: ${result.email}`
          });
        } catch (error) {
          throw error;
        }
        break;
        
      case 'removeMember':
        try {
          await familyService.removeMember(context.familyId, analysis.parameters.memberId);
          actions.push({
            type: 'delete',
            service: 'hourse',
            method: 'removeMember',
            parameters: analysis.parameters,
            description: `Removed hourse member`
          });
        } catch (error) {
          throw error;
        }
        break;
        
      case 'inviteMember':
        try {
          const result = await familyService.inviteMember(context.familyId, analysis.parameters);
          actions.push({
            type: 'create',
            service: 'hourse',
            method: 'inviteMember',
            parameters: analysis.parameters,
            description: `Invitation sent to: ${result.email}`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeChatActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'sendMessage':
        try {
          const result = await chatService.sendMessage(context.familyId, {
            content: analysis.parameters.message,
            type: 'text',
            senderId: context.userId
          });
          actions.push({
            type: 'create',
            service: 'chat',
            method: 'sendMessage',
            parameters: analysis.parameters,
            description: `Message sent to hourse chat`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeSafetyActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'sendEmergencyAlert':
        try {
          await safetyService.sendEmergencyAlert();
          actions.push({
            type: 'create',
            service: 'safety',
            method: 'sendEmergencyAlert',
            parameters: {},
            description: `Emergency alert sent to all hourse members`
          });
        } catch (error) {
          throw error;
        }
        break;
        
      case 'checkIn':
        try {
          await safetyService.checkIn();
          actions.push({
            type: 'update',
            service: 'safety',
            method: 'checkIn',
            parameters: {},
            description: `Safety check-in completed`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeLocationActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'shareLocation':
        try {
          await locationService.shareLocation(context.userId);
          actions.push({
            type: 'update',
            service: 'location',
            method: 'shareLocation',
            parameters: {},
            description: `Location shared with hourse`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeHealthActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'addHealthRecord':
        try {
          const result = await healthService.addHealthRecord(context.userId, {
            type: analysis.parameters.type,
            value: analysis.parameters.value,
            date: new Date()
          });
          actions.push({
            type: 'create',
            service: 'health',
            method: 'addHealthRecord',
            parameters: analysis.parameters,
            description: `Health record added: ${analysis.parameters.type}`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeExpenseActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'addExpense':
        try {
          const result = await expenseService.addExpense(context.familyId, {
            amount: analysis.parameters.amount,
            category: analysis.parameters.category,
            description: analysis.parameters.description,
            userId: context.userId
          });
          actions.push({
            type: 'create',
            service: 'expenses',
            method: 'addExpense',
            parameters: analysis.parameters,
            description: `Expense added: $${analysis.parameters.amount}`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeShoppingActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'addShoppingItem':
        try {
          const result = await shoppingService.addItem(context.familyId, {
            name: analysis.parameters.item,
            quantity: analysis.parameters.quantity || 1,
            addedBy: context.userId
          });
          actions.push({
            type: 'create',
            service: 'shopping',
            method: 'addShoppingItem',
            parameters: analysis.parameters,
            description: `Shopping item added: ${analysis.parameters.item}`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async executeNoteActions(analysis: any, context: AIAgentContext): Promise<AIAgentAction[]> {
    const actions: AIAgentAction[] = [];
    
    switch (analysis.method) {
      case 'createNote':
        try {
          const result = await noteService.createNote(context.familyId, {
            title: analysis.parameters.title || 'New Note',
            content: analysis.parameters.content,
            createdBy: context.userId
          });
          actions.push({
            type: 'create',
            service: 'notes',
            method: 'createNote',
            parameters: analysis.parameters,
            description: `Note created: ${result.title}`
          });
        } catch (error) {
          throw error;
        }
        break;
    }
    
    return actions;
  }

  private async generateResponse(analysis: any, actions: AIAgentAction[], context: AIAgentContext): Promise<AIAgentResponse> {
    let message = '';
    const suggestions: string[] = [];
    
    // Generate response based on actions
    if (actions.length > 0) {
      const action = actions[0];
      switch (action.type) {
        case 'create':
          message = `✅ ${action.description}. Is there anything else you'd like me to help you with?`;
          break;
        case 'update':
          message = `✅ ${action.description}. Is there anything else you'd like me to help you with?`;
          break;
        case 'delete':
          message = `✅ ${action.description}. Is there anything else you'd like me to help you with?`;
          break;
        case 'read':
          message = `Here's what I found: ${action.description}`;
          break;
        default:
          message = `I've completed the requested action. Is there anything else you'd like me to help you with?`;
      }
    } else {
      // Help response
      message = `I'm your AI assistant for Bondarys! I can help you with:\n\n` +
        `👨‍👩‍👧‍👦 **hourse Management**: Add/remove members, invite people\n` +
        `💬 **Chat**: Send messages to hourse groups\n` +
        `🛡️ **Safety**: Emergency alerts, check-ins, location sharing\n` +
        `💊 **Health**: Track health records, medications\n` +
        `💰 **Expenses**: Add expenses, track spending\n` +
        `🛒 **Shopping**: Manage shopping lists\n` +
        `📝 **Notes**: Create and share notes\n` +
        `🎮 **Games**: Start hourse games\n\n` +
        `Just tell me what you'd like to do!`;
      
      suggestions.push(
        'Add a hourse member',
        'Send a message to hourse',
        'Share my location',
        'Add an expense',
        'Create a shopping list'
      );
    }
    
    return {
      message,
      actions,
      suggestions,
      confidence: analysis.confidence
    };
  }

  // Utility methods for entity extraction
  private extractEmail(message: string): string {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = message.match(emailRegex);
    return match ? match[0] : '';
  }

  private extractMemberId(message: string): string {
    // Extract member ID from message
    const idRegex = /\b[A-Za-z0-9]{24}\b/;
    const match = message.match(idRegex);
    return match ? match[0] : '';
  }

  private extractMessage(message: string): string {
    // Extract message content after "send message" or similar
    const sendIndex = message.indexOf('send');
    if (sendIndex !== -1) {
      return message.substring(sendIndex + 4).trim();
    }
    return message;
  }

  private extractHealthType(message: string): string {
    if (message.includes('medication') || message.includes('medicine')) return 'medication';
    if (message.includes('weight')) return 'weight';
    if (message.includes('blood pressure')) return 'blood_pressure';
    if (message.includes('temperature')) return 'temperature';
    return 'general';
  }

  private extractAmount(message: string): number {
    const amountRegex = /\$?(\d+(?:\.\d{2})?)/;
    const match = message.match(amountRegex);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractCategory(message: string): string {
    if (message.includes('food') || message.includes('meal')) return 'food';
    if (message.includes('transport') || message.includes('gas')) return 'transportation';
    if (message.includes('entertainment') || message.includes('movie')) return 'entertainment';
    if (message.includes('health') || message.includes('medical')) return 'healthcare';
    return 'other';
  }

  private extractItem(message: string): string {
    // Extract item name from shopping message
    const buyIndex = message.indexOf('buy');
    const purchaseIndex = message.indexOf('purchase');
    const shoppingIndex = message.indexOf('shopping');
    
    let startIndex = Math.max(buyIndex, purchaseIndex, shoppingIndex);
    if (startIndex === -1) return '';
    
    return message.substring(startIndex).replace(/buy|purchase|shopping/gi, '').trim();
  }

  private extractContent(message: string): string {
    // Extract note content
    const noteIndex = message.indexOf('note');
    const writeIndex = message.indexOf('write');
    
    let startIndex = Math.max(noteIndex, writeIndex);
    if (startIndex === -1) return message;
    
    return message.substring(startIndex).replace(/note|write/gi, '').trim();
  }

  // Memory management
  private getConversationId(context: AIAgentContext): string {
    return `${context.userId}_${context.familyId}`;
  }

  private getMemory(conversationId: string): AIAgentMemory {
    if (!this.memory.has(conversationId)) {
      this.memory.set(conversationId, {
        conversationId,
        messages: [],
        context: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    return this.memory.get(conversationId)!;
  }

  private updateMemory(conversationId: string, memory: AIAgentMemory): void {
    memory.updatedAt = Date.now();
    this.memory.set(conversationId, memory);
  }

  // Public methods for external access
  async getCapabilities(): Promise<AIAgentCapability[]> {
    return this.capabilities;
  }

  async getConversationHistory(userId: string, familyId: string): Promise<AIAgentMemory | null> {
    const conversationId = this.getConversationId({ userId, familyId } as AIAgentContext);
    return this.memory.get(conversationId) || null;
  }

  async clearConversationHistory(userId: string, familyId: string): Promise<void> {
    const conversationId = this.getConversationId({ userId, familyId } as AIAgentContext);
    this.memory.delete(conversationId);
  }

  async getFamilyData(context: AIAgentContext): Promise<any> {
    try {
      const [hourse, members, stats] = await Promise.all([
        familyService.getFamily(context.familyId),
        familyService.getMembers(context.familyId),
        familyService.getFamilyStats(context.familyId)
      ]);
      
      return {
        hourse,
        members,
        stats
      };
    } catch (error) {
      console.error('Error getting hourse data:', error);
      throw error;
    }
  }

  async getUserData(context: AIAgentContext): Promise<any> {
    try {
      const [user, preferences, stats] = await Promise.all([
        userService.getUser(context.userId),
        userService.getUserPreferences(context.userId),
        userService.getUserStats(context.userId)
      ]);
      
      return {
        user,
        preferences,
        stats
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  async getChatData(context: AIAgentContext): Promise<any> {
    try {
      const [chats, messages, unreadCount] = await Promise.all([
        chatService.getChats(context.familyId),
        chatService.getRecentMessages(context.familyId),
        chatService.getUnreadCount(context.userId)
      ]);
      
      return {
        chats,
        messages,
        unreadCount
      };
    } catch (error) {
      console.error('Error getting chat data:', error);
      throw error;
    }
  }

  async getSafetyData(context: AIAgentContext): Promise<any> {
    try {
      const [status, contacts, geofences] = await Promise.all([
        safetyService.getSafetyStatus(),
        safetyService.getEmergencyContacts(),
        safetyService.getGeofences()
      ]);
      
      return {
        status,
        contacts,
        geofences
      };
    } catch (error) {
      console.error('Error getting safety data:', error);
      throw error;
    }
  }
}

export const aiAgentService = new AIAgentService(); 