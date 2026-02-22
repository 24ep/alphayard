// Mock PollsService - TODO: Implement when database schema is ready

export class PollsService {
  // Mock methods to prevent import errors
  static async createPoll() { return null; }
  static async getPoll() { return null; }
  static async vote() { return null; }
  static async getVoters() { return []; }
  static async closePoll() { return false; }
  static async deletePoll() { return false; }
}

// Mock interfaces
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  expiresAt: Date;
  isActive: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}
