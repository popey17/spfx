import type { ILeaderboardService } from './ILeaderboardService';
import type { IndividualLeaderboardEntry, LeaderboardData, LobtLeaderboardEntry } from './leaderboardTypes';

const MOCK_LOBT_NAMES = [
  'ADA',
  'CBGT',
  'Tech COO',
  'GFMT',
  'FRT'
];

const MOCK_PLAYER_NAMES = [
  'Clickr Tech',
  'test',
  'ahkar',
  'aungmyat',
  'ahkar.test',
  'ahkar.test0',
  'ahkar.real',
  'ahkar.new',
  'aungmyat',
  'amk',
  'new.ahkar.user',
  'ahkar.name.long.enough.to.test.profile',
  'someone',
  'new.clickr',
  'USER123',
  'ALICE.CHEN',
  'BOB.KUMAR',
  'CAROL.TAN',
  'DAVID.LIM',
  'EMMA.WONG'
];

function buildMockIndividualRanking(): IndividualLeaderboardEntry[] {
  return MOCK_PLAYER_NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    lobt: MOCK_LOBT_NAMES[index % MOCK_LOBT_NAMES.length],
    xp: 5910 - index * 137
  }));
}

function buildMockLobtRanking(): LobtLeaderboardEntry[] {
  return MOCK_LOBT_NAMES.map((lobt, index) => ({
    rank: index + 1,
    lobt,
    xp: 48250 - index * 4210
  }));
}

/** Placeholder data when SharePoint is unavailable. */
export class InMemoryLeaderboardService implements ILeaderboardService {
  public async loadLeaderboard(): Promise<LeaderboardData> {
    return {
      individual: buildMockIndividualRanking(),
      lobt: buildMockLobtRanking()
    };
  }
}
