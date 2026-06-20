import type { LeaderboardData } from './leaderboardTypes';

export interface ILeaderboardService {
  loadLeaderboard(): Promise<LeaderboardData>;
}
