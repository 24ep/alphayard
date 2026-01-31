import { Platform } from 'react-native';
import { apiClient } from '../api/apiClient';
import { analyticsService } from '../analytics/AnalyticsService';

interface Game {
  id: string;
  name: string;
  description: string;
  category: 'puzzle' | 'action' | 'strategy' | 'arcade' | 'educational';
  difficulty: 'easy' | 'medium' | 'hard';
  maxPlayers: number;
  isMultiplayer: boolean;
  isOnline: boolean;
  thumbnail: string;
  rating: number;
  playCount: number;
}

interface GameSession {
  id: string;
  gameId: string;
  playerId: string;
  startTime: number;
  endTime?: number;
  score: number;
  level: number;
  achievements: string[];
  isCompleted: boolean;
}

interface GameLeaderboard {
  gameId: string;
  entries: {
    playerId: string;
    playerName: string;
    score: number;
    rank: number;
    timestamp: number;
  }[];
}

interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockDate?: number;
  progress?: number;
  maxProgress?: number;
}

export class GamingService {
  private static instance: GamingService;
  private currentSession: GameSession | null = null;
  private games: Game[] = [];
  private achievements: GameAchievement[] = [];

  private constructor() {}

  static getInstance(): GamingService {
    if (!GamingService.instance) {
      GamingService.instance = new GamingService();
    }
    return GamingService.instance;
  }

  // Initialize gaming service
  async initialize(): Promise<void> {
    try {
      // Load available games
      await this.loadGames();
      
      // Load user achievements
      await this.loadAchievements();
      
      console.log('Gaming service initialized');
    } catch (error) {
      console.error('Failed to initialize gaming service:', error);
      throw error;
    }
  }

  // Load available games
  private async loadGames(): Promise<void> {
    try {
      const response = await apiClient.get('/games');
      this.games = response.data;
    } catch (error) {
      console.error('Failed to load games:', error);
      // Load default games
      this.games = this.getDefaultGames();
    }
  }

  // Load user achievements
  private async loadAchievements(): Promise<void> {
    try {
      const response = await apiClient.get('/games/achievements');
      this.achievements = response.data;
    } catch (error) {
      console.error('Failed to load achievements:', error);
      this.achievements = [];
    }
  }

  // Get default games
  private getDefaultGames(): Game[] {
    return [
      {
        id: 'memory-match',
        name: 'Memory Match',
        description: 'Match pairs of cards to test your memory',
        category: 'puzzle',
        difficulty: 'easy',
        maxPlayers: 1,
        isMultiplayer: false,
        isOnline: false,
        thumbnail: '🧠',
        rating: 4.5,
        playCount: 0,
      },
      {
        id: 'Circle-quiz',
        name: 'Circle Quiz',
        description: 'Test your knowledge about your Circle',
        category: 'educational',
        difficulty: 'medium',
        maxPlayers: 4,
        isMultiplayer: true,
        isOnline: true,
        thumbnail: '❓',
        rating: 4.2,
        playCount: 0,
      },
      {
        id: 'location-explorer',
        name: 'Location Explorer',
        description: 'Explore and learn about different places',
        category: 'educational',
        difficulty: 'easy',
        maxPlayers: 1,
        isMultiplayer: false,
        isOnline: true,
        thumbnail: 'map',
        rating: 4.0,
        playCount: 0,
      },
      {
        id: 'safety-champion',
        name: 'Safety Champion',
        description: 'Learn about safety and emergency procedures',
        category: 'educational',
        difficulty: 'medium',
        maxPlayers: 2,
        isMultiplayer: true,
        isOnline: false,
        thumbnail: 'shield',
        rating: 4.8,
        playCount: 0,
      },
      {
        id: 'word-builder',
        name: 'Word Builder',
        description: 'Create words from given letters',
        category: 'puzzle',
        difficulty: 'medium',
        maxPlayers: 1,
        isMultiplayer: false,
        isOnline: false,
        thumbnail: 'note-text',
        rating: 4.3,
        playCount: 0,
      },
    ];
  }

  // Get all games
  getGames(): Game[] {
    return [...this.games];
  }

  // Get games by category
  getGamesByCategory(category: string): Game[] {
    return this.games.filter(game => game.category === category);
  }

  // Get games by difficulty
  getGamesByDifficulty(difficulty: string): Game[] {
    return this.games.filter(game => game.difficulty === difficulty);
  }

  // Get game by ID
  getGameById(gameId: string): Game | null {
    return this.games.find(game => game.id === gameId) || null;
  }

  // Start a game session
  async startGame(gameId: string, playerId: string): Promise<GameSession> {
    try {
      const game = this.getGameById(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      const session: GameSession = {
        id: this.generateSessionId(),
        gameId,
        playerId,
        startTime: Date.now(),
        score: 0,
        level: 1,
        achievements: [],
        isCompleted: false,
      };

      this.currentSession = session;

      // Track game start
      analyticsService.trackEvent('game_started', {
        gameId,
        gameName: game.name,
        category: game.category,
        difficulty: game.difficulty,
      });

      console.log(`Game session started: ${game.name}`);
      return session;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  // End current game session
  async endGame(score: number, level: number, achievements: string[] = []): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      this.currentSession.endTime = Date.now();
      this.currentSession.score = score;
      this.currentSession.level = level;
      this.currentSession.achievements = achievements;
      this.currentSession.isCompleted = true;

      // Save session to server
      await apiClient.post('/games/sessions', this.currentSession);

      // Update game play count
      await this.updateGamePlayCount(this.currentSession.gameId);

      // Track game completion
      analyticsService.trackEvent('game_completed', {
        gameId: this.currentSession.gameId,
        score,
        level,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        achievements: achievements.length,
      });

      console.log('Game session ended');
      this.currentSession = null;
    } catch (error) {
      console.error('Failed to end game:', error);
      throw error;
    }
  }

  // Update game play count
  private async updateGamePlayCount(gameId: string): Promise<void> {
    try {
      await apiClient.put(`/games/${gameId}/play-count`);
    } catch (error) {
      console.error('Failed to update game play count:', error);
    }
  }

  // Get current game session
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  // Get game leaderboard
  async getGameLeaderboard(gameId: string): Promise<GameLeaderboard> {
    try {
      const response = await apiClient.get(`/games/${gameId}/leaderboard`);
      return response.data;
    } catch (error) {
      console.error('Failed to get game leaderboard:', error);
      return {
        gameId,
        entries: [],
      };
    }
  }

  // Submit score to leaderboard
  async submitScore(gameId: string, score: number): Promise<void> {
    try {
      await apiClient.post(`/games/${gameId}/scores`, { score });
      
      // Track score submission
      analyticsService.trackEvent('score_submitted', {
        gameId,
        score,
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }

  // Get user achievements
  getUserAchievements(): GameAchievement[] {
    return [...this.achievements];
  }

  // Unlock achievement
  async unlockAchievement(achievementId: string): Promise<void> {
    try {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockDate = Date.now();

        await apiClient.post('/games/achievements/unlock', { achievementId });

        // Track achievement unlock
        analyticsService.trackEvent('achievement_unlocked', {
          achievementId,
          achievementName: achievement.name,
        });

        console.log(`Achievement unlocked: ${achievement.name}`);
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  }

  // Update achievement progress
  async updateAchievementProgress(achievementId: string, progress: number): Promise<void> {
    try {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement) {
        achievement.progress = progress;
        
        if (achievement.maxProgress && progress >= achievement.maxProgress) {
          await this.unlockAchievement(achievementId);
        }

        await apiClient.put(`/games/achievements/${achievementId}/progress`, { progress });
      }
    } catch (error) {
      console.error('Failed to update achievement progress:', error);
      throw error;
    }
  }

  // Get game statistics
  async getGameStatistics(gameId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/games/${gameId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Failed to get game statistics:', error);
      return {
        totalPlays: 0,
        averageScore: 0,
        highestScore: 0,
        totalPlayTime: 0,
      };
    }
  }

  // Get user game history
  async getUserGameHistory(): Promise<GameSession[]> {
    try {
      const response = await apiClient.get('/games/sessions/history');
      return response.data;
    } catch (error) {
      console.error('Failed to get user game history:', error);
      return [];
    }
  }

  // Get multiplayer games
  getMultiplayerGames(): Game[] {
    return this.games.filter(game => game.isMultiplayer);
  }

  // Get online games
  getOnlineGames(): Game[] {
    return this.games.filter(game => game.isOnline);
  }

  // Get popular games
  getPopularGames(limit: number = 5): Game[] {
    return this.games
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  // Get highly rated games
  getHighlyRatedGames(limit: number = 5): Game[] {
    return this.games
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Search games
  searchGames(query: string): Game[] {
    const lowerQuery = query.toLowerCase();
    return this.games.filter(game => 
      game.name.toLowerCase().includes(lowerQuery) ||
      game.description.toLowerCase().includes(lowerQuery) ||
      game.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Get game recommendations
  getGameRecommendations(userId: string): Game[] {
    // This would typically use machine learning to recommend games
    // For now, return popular games
    return this.getPopularGames(3);
  }

  // Generate session ID
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  // Check if game is available
  isGameAvailable(gameId: string): boolean {
    const game = this.getGameById(gameId);
    return game !== null;
  }

  // Get game categories
  getGameCategories(): string[] {
    const categories = new Set(this.games.map(game => game.category));
    return Array.from(categories);
  }

  // Get game difficulties
  getGameDifficulties(): string[] {
    const difficulties = new Set(this.games.map(game => game.difficulty));
    return Array.from(difficulties);
  }

  // Get total games count
  getTotalGamesCount(): number {
    return this.games.length;
  }

  // Get total achievements count
  getTotalAchievementsCount(): number {
    return this.achievements.length;
  }

  // Get unlocked achievements count
  getUnlockedAchievementsCount(): number {
    return this.achievements.filter(a => a.isUnlocked).length;
  }

  // Get achievement progress percentage
  getAchievementProgressPercentage(): number {
    const total = this.achievements.length;
    const unlocked = this.getUnlockedAchievementsCount();
    return total > 0 ? (unlocked / total) * 100 : 0;
  }
}

export const gamingService = GamingService.getInstance();
export default gamingService; 
