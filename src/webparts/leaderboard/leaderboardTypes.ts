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
  playerCount: number;
  xp: number;
}

export interface LeaderboardData {
  individual: IndividualLeaderboardEntry[];
  lobt: LobtLeaderboardEntry[];
}

export type LeaderboardTab = 'individual' | 'lobt';

/** Top-N thresholds synced to Users.LeaderBoardData when the leaderboard popup opens. */
export const LEADERBOARD_USER_INDIVIDUAL_TOP_LIMIT = 50;
export const LEADERBOARD_USER_LOBT_TOP_LIMIT = 10;

/** JSON persisted on the Users list LeaderBoardData column. */
export interface UserLeaderBoardData {
  individual: {
    inTop50: boolean;
    rank?: number;
  };
  lobt: {
    inTop10: boolean;
    rank?: number;
    lobt?: string;
  };
  checkedAt: string;
}

/** Raw Users list row used while building leaderboard rankings. */
export interface UsersListRow {
  id: number;
  title: string;
  email: string;
  lobt: string;
  totalXp: number;
}
