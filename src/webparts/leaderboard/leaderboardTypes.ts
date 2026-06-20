/** One row in the individual (player) leaderboard. */
export interface IndividualLeaderboardEntry {
  rank: number;
  name: string;
  lobt: string;
  xp: number;
}

/** One row in the LOBT (department) leaderboard. */
export interface LobtLeaderboardEntry {
  rank: number;
  lobt: string;
  xp: number;
}

export interface LeaderboardData {
  individual: IndividualLeaderboardEntry[];
  lobt: LobtLeaderboardEntry[];
}

export type LeaderboardTab = 'individual' | 'lobt';

/** Raw Users list row used while building leaderboard rankings. */
export interface UsersListRow {
  id: number;
  title: string;
  email: string;
  lobt: string;
  totalXp: number;
}
