import { aiAnalyticsService } from './AIAnalyticsService';
import { userService } from '../user/UserService';
import { familyService } from '../hourse/FamilyService';
import { chatService } from '../chat/ChatService';
import { analyticsService } from '../analytics/AnalyticsService';

export interface AITrainingData {
  userId: string;
  familyId: string;
  timestamp: number;
  input: string;
  intent: string;
  confidence: number;
  actions: any[];
  success: boolean;
  userFeedback?: number; // 1-5 rating
  userCorrection?: string;
  context: any;
}

export interface AITrainingModel {
  id: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainingData: {
    totalSamples: number;
    positiveSamples: number;
    negativeSamples: number;
  };
  features: string[];
  intents: string[];
}

export interface AITrainingConfig {
  minConfidence: number;
  maxTrainingSamples: number;
  retrainThreshold: number;
  featureExtraction: {
    useNLP: boolean;
    useContext: boolean;
    useUserHistory: boolean;
  };
  modelType: 'intent' | 'action' | 'response';
}

export interface AITrainingResult {
  modelId: string;
  accuracy: number;
  improvements: string[];
  recommendations: string[];
  nextTrainingDate: number;
}

class AITrainingService {
  private trainingData: AITrainingData[] = [];
  private models: AITrainingModel[] = [];
  private config: AITrainingConfig = {
    minConfidence: 0.7,
    maxTrainingSamples: 10000,
    retrainThreshold: 0.8,
    featureExtraction: {
      useNLP: true,
      useContext: true,
      useUserHistory: true
    },
    modelType: 'intent'
  };

  async addTrainingData(data: AITrainingData): Promise<void> {
    try {
      this.trainingData.push(data);
      
      // Keep only recent training data
      if (this.trainingData.length > this.config.maxTrainingSamples) {
        this.trainingData = this.trainingData.slice(-this.config.maxTrainingSamples);
      }

      // Store training data
      await this.storeTrainingData(data);

      // Check if retraining is needed
      await this.checkRetrainingNeeded();

      // Track analytics
      analyticsService.trackEvent('ai_training_data_added', {
        intent: data.intent,
        confidence: data.confidence,
        success: data.success,
        hasFeedback: !!data.userFeedback,
        hasCorrection: !!data.userCorrection
      });

    } catch (error) {
      console.error('Failed to add training data:', error);
      throw error;
    }
  }

  async trainModel(): Promise<AITrainingResult> {
    try {
      console.log('Starting AI model training...');
      
      // Prepare training data
      const preparedData = await this.prepareTrainingData();
      
      // Extract features
      const features = await this.extractFeatures(preparedData);
      
      // Train intent recognition model
      const intentModel = await this.trainIntentModel(features);
      
      // Train action prediction model
      const actionModel = await this.trainActionModel(features);
      
      // Train response generation model
      const responseModel = await this.trainResponseModel(features);
      
      // Evaluate models
      const evaluation = await this.evaluateModels([intentModel, actionModel, responseModel]);
      
      // Create new model
      const newModel: AITrainingModel = {
        id: `model_${Date.now()}`,
        version: '1.0.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        performance: evaluation.overall,
        trainingData: {
          totalSamples: preparedData.length,
          positiveSamples: preparedData.filter(d => d.success).length,
          negativeSamples: preparedData.filter(d => !d.success).length
        },
        features: Object.keys(features[0] || {}),
        intents: [...new Set(preparedData.map(d => d.intent))]
      };
      
      this.models.push(newModel);
      
      // Store model
      await this.storeModel(newModel);
      
      // Track analytics
      analyticsService.trackEvent('ai_model_trained', {
        modelId: newModel.id,
        accuracy: newModel.performance.accuracy,
        totalSamples: newModel.trainingData.totalSamples,
        intentsCount: newModel.intents.length
      });
      
      return {
        modelId: newModel.id,
        accuracy: newModel.performance.accuracy,
        improvements: evaluation.improvements,
        recommendations: evaluation.recommendations,
        nextTrainingDate: Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 week
      };

    } catch (error) {
      console.error('Failed to train model:', error);
      throw error;
    }
  }

  async improveIntentRecognition(input: string, context: any): Promise<{
    intent: string;
    confidence: number;
    alternatives: Array<{ intent: string; confidence: number }>;
  }> {
    try {
      // Get user history
      const userHistory = await this.getUserHistory(context.userId);
      
      // Extract features
      const features = await this.extractFeaturesFromInput(input, context, userHistory);
      
      // Predict intent using trained model
      const prediction = await this.predictIntent(features);
      
      // Get alternatives
      const alternatives = await this.getIntentAlternatives(features, prediction.intent);
      
      return {
        intent: prediction.intent,
        confidence: prediction.confidence,
        alternatives
      };

    } catch (error) {
      console.error('Failed to improve intent recognition:', error);
      throw error;
    }
  }

  async improveActionPrediction(intent: string, context: any): Promise<{
    actions: any[];
    confidence: number;
    alternatives: any[];
  }> {
    try {
      // Get similar cases from training data
      const similarCases = this.trainingData.filter(d => 
        d.intent === intent && d.success
      );
      
      if (similarCases.length === 0) {
        return {
          actions: [],
          confidence: 0,
          alternatives: []
        };
      }
      
      // Find best matching case
      const bestCase = similarCases.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      // Generate alternatives
      const alternatives = similarCases
        .slice(0, 3)
        .map(c => c.actions)
        .filter((_, index) => index > 0);
      
      return {
        actions: bestCase.actions,
        confidence: bestCase.confidence,
        alternatives
      };

    } catch (error) {
      console.error('Failed to improve action prediction:', error);
      throw error;
    }
  }

  async improveResponseGeneration(intent: string, actions: any[], context: any): Promise<{
    response: string;
    suggestions: string[];
    confidence: number;
  }> {
    try {
      // Get successful responses for similar intents
      const successfulResponses = this.trainingData.filter(d => 
        d.intent === intent && d.success && d.userFeedback && d.userFeedback >= 4
      );
      
      if (successfulResponses.length === 0) {
        return {
          response: 'I understand your request. How can I help you further?',
          suggestions: ['Try rephrasing your request', 'Ask for specific help'],
          confidence: 0.5
        };
      }
      
      // Generate response based on successful patterns
      const response = await this.generateResponse(successfulResponses, actions);
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(intent, context);
      
      return {
        response,
        suggestions,
        confidence: 0.8
      };

    } catch (error) {
      console.error('Failed to improve response generation:', error);
      throw error;
    }
  }

  async getUserFeedback(userId: string, sessionId: string, rating: number, feedback?: string): Promise<void> {
    try {
      // Find training data for this session
      const sessionData = this.trainingData.filter(d => 
        d.userId === userId && d.timestamp >= Date.now() - (30 * 60 * 1000) // Last 30 minutes
      );
      
      // Update training data with feedback
      sessionData.forEach(data => {
        data.userFeedback = rating;
        if (feedback) {
          data.userCorrection = feedback;
        }
      });
      
      // Store updated training data
      await this.storeTrainingData(sessionData[sessionData.length - 1]);
      
      // Track analytics
      analyticsService.trackEvent('ai_user_feedback', {
        userId,
        rating,
        hasFeedback: !!feedback,
        sessionId
      });

    } catch (error) {
      console.error('Failed to store user feedback:', error);
      throw error;
    }
  }

  async getTrainingStats(): Promise<{
    totalSamples: number;
    recentSamples: number;
    successRate: number;
    averageConfidence: number;
    topIntents: Array<{ intent: string; count: number; successRate: number }>;
    modelPerformance: AITrainingModel[];
  }> {
    try {
      const recentData = this.trainingData.filter(d => 
        d.timestamp >= Date.now() - (7 * 24 * 60 * 60 * 1000) // Last week
      );
      
      const successRate = this.trainingData.length > 0 
        ? this.trainingData.filter(d => d.success).length / this.trainingData.length 
        : 0;
      
      const averageConfidence = this.trainingData.length > 0
        ? this.trainingData.reduce((sum, d) => sum + d.confidence, 0) / this.trainingData.length
        : 0;
      
      const intentCounts = new Map<string, { count: number; success: number }>();
      this.trainingData.forEach(d => {
        const current = intentCounts.get(d.intent) || { count: 0, success: 0 };
        current.count++;
        if (d.success) current.success++;
        intentCounts.set(d.intent, current);
      });
      
      const topIntents = Array.from(intentCounts.entries())
        .map(([intent, data]) => ({
          intent,
          count: data.count,
          successRate: data.count > 0 ? data.success / data.count : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalSamples: this.trainingData.length,
        recentSamples: recentData.length,
        successRate,
        averageConfidence,
        topIntents,
        modelPerformance: this.models
      };

    } catch (error) {
      console.error('Failed to get training stats:', error);
      throw error;
    }
  }

  // Private helper methods
  private async prepareTrainingData(): Promise<AITrainingData[]> {
    // Filter out low-quality data
    return this.trainingData.filter(d => 
      d.confidence >= this.config.minConfidence &&
      d.input.length > 3 &&
      d.intent !== 'unknown'
    );
  }

  private async extractFeatures(data: AITrainingData[]): Promise<any[]> {
    return data.map(d => ({
      inputLength: d.input.length,
      wordCount: d.input.split(' ').length,
      hasQuestion: d.input.includes('?'),
      hasExclamation: d.input.includes('!'),
      confidence: d.confidence,
      success: d.success ? 1 : 0,
      userFeedback: d.userFeedback || 0,
      timestamp: d.timestamp,
      // Add more features as needed
    }));
  }

  private async extractFeaturesFromInput(input: string, context: any, userHistory: any[]): Promise<any> {
    return {
      inputLength: input.length,
      wordCount: input.split(' ').length,
      hasQuestion: input.includes('?'),
      hasExclamation: input.includes('!'),
      userRole: context.userRole,
      familySize: context.familySize || 0,
      previousIntents: userHistory.slice(-5).map(h => h.intent),
      // Add more features as needed
    };
  }

  private async trainIntentModel(features: any[]): Promise<any> {
    // Simplified training - in production, use ML library
    console.log('Training intent model with', features.length, 'samples');
    return { type: 'intent', accuracy: 0.85 };
  }

  private async trainActionModel(features: any[]): Promise<any> {
    // Simplified training - in production, use ML library
    console.log('Training action model with', features.length, 'samples');
    return { type: 'action', accuracy: 0.80 };
  }

  private async trainResponseModel(features: any[]): Promise<any> {
    // Simplified training - in production, use ML library
    console.log('Training response model with', features.length, 'samples');
    return { type: 'response', accuracy: 0.82 };
  }

  private async evaluateModels(models: any[]): Promise<{
    overall: { accuracy: number; precision: number; recall: number; f1Score: number };
    improvements: string[];
    recommendations: string[];
  }> {
    const avgAccuracy = models.reduce((sum, m) => sum + m.accuracy, 0) / models.length;
    
    const improvements: string[] = [];
    const recommendations: string[] = [];
    
    if (avgAccuracy < 0.8) {
      improvements.push('Model accuracy below target');
      recommendations.push('Add more training data');
    }
    
    if (avgAccuracy > 0.9) {
      improvements.push('Excellent model performance');
      recommendations.push('Consider model optimization');
    }
    
    return {
      overall: {
        accuracy: avgAccuracy,
        precision: avgAccuracy * 0.95,
        recall: avgAccuracy * 0.93,
        f1Score: avgAccuracy * 0.94
      },
      improvements,
      recommendations
    };
  }

  private async predictIntent(features: any): Promise<{ intent: string; confidence: number }> {
    // Simplified prediction - in production, use trained model
    const intents = ['hourse', 'chat', 'safety', 'expenses', 'shopping', 'notes'];
    const intent = intents[Math.floor(Math.random() * intents.length)];
    const confidence = 0.7 + Math.random() * 0.3;
    
    return { intent, confidence };
  }

  private async getIntentAlternatives(features: any, primaryIntent: string): Promise<Array<{ intent: string; confidence: number }>> {
    const intents = ['hourse', 'chat', 'safety', 'expenses', 'shopping', 'notes'];
    return intents
      .filter(intent => intent !== primaryIntent)
      .map(intent => ({
        intent,
        confidence: 0.3 + Math.random() * 0.4
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  private async generateResponse(successfulResponses: AITrainingData[], actions: any[]): Promise<string> {
    if (successfulResponses.length === 0) {
      return 'I understand your request. How can I help you further?';
    }
    
    // Use the most recent successful response as template
    const template = successfulResponses[successfulResponses.length - 1];
    
    // Customize based on actions
    if (actions.length > 0) {
      const action = actions[0];
      return `✅ ${action.description}. Is there anything else you'd like me to help you with?`;
    }
    
    return template.userCorrection || 'I understand your request. How can I help you further?';
  }

  private async generateSuggestions(intent: string, context: any): Promise<string[]> {
    const suggestions: { [key: string]: string[] } = {
      hourse: ['Add a hourse member', 'Invite someone to join', 'Update hourse settings'],
      chat: ['Send a message', 'Create a new chat', 'View chat history'],
      safety: ['Share location', 'Send emergency alert', 'Check in'],
      expenses: ['Add an expense', 'View expense report', 'Set budget'],
      shopping: ['Add shopping item', 'View shopping list', 'Mark as purchased'],
      notes: ['Create a note', 'Share a note', 'View all notes']
    };
    
    return suggestions[intent] || ['Try rephrasing your request', 'Ask for specific help'];
  }

  private async getUserHistory(userId: string): Promise<any[]> {
    // Get user's recent interactions
    return this.trainingData
      .filter(d => d.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }

  private async checkRetrainingNeeded(): Promise<void> {
    const stats = await this.getTrainingStats();
    
    if (stats.successRate < this.config.retrainThreshold) {
      console.log('Retraining needed due to low success rate');
      await this.trainModel();
    }
  }

  private async storeTrainingData(data: AITrainingData): Promise<void> {
    // Store in local storage or send to server
    try {
      // This would use AsyncStorage or API call in real implementation
    } catch (error) {
      console.error('Failed to store training data:', error);
    }
  }

  private async storeModel(model: AITrainingModel): Promise<void> {
    // Store model in local storage or send to server
    try {
      // This would use AsyncStorage or API call in real implementation
    } catch (error) {
      console.error('Failed to store model:', error);
    }
  }
}

export const aiTrainingService = new AITrainingService(); 