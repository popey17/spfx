import type {
  IndividualLeaderboardEntry,
  LeaderboardData,
  LobtLeaderboardEntry,
  UserLeaderBoardData,
  UsersListRow
} from './leaderboardTypes';

export function buildLeaderboardFromUsersRows(
  rows: UsersListRow[],
  individualTopCount: number,
  lobtTopCount = 5
): LeaderboardData {
  return {
    individual: buildIndividualRanking(rows, individualTopCount),
    lobt: buildLobtRankingFromUsers(rows, lobtTopCount)
  };
}

export function buildIndividualRanking(rows: UsersListRow[], topCount: number): IndividualLeaderboardEntry[] {
  const sorted = rows
    .slice()
    .sort((a, b) => b.totalXp - a.totalXp || a.title.localeCompare(b.title));

  const result: IndividualLeaderboardEntry[] = [];
  const limit = Math.min(topCount, sorted.length);

  for (let i = 0; i < limit; i++) {
    result.push({
      rank: i + 1,
      name: sorted[i].title,
      lobt: sorted[i].lobt,
      xp: sorted[i].totalXp
    });
  }

  return result;
}

export function buildLobtRankingFromTotals(
  totals: Array<{ lobt: string; xp: number; orderNo?: number; playerCount?: number }>,
  topCount: number
): LobtLeaderboardEntry[] {
  const sorted = totals
    .slice()
    .sort((a, b) => {
      if (b.xp !== a.xp) {
        return b.xp - a.xp;
      }

      const orderA = a.orderNo === undefined ? Number.MAX_VALUE : a.orderNo;
      const orderB = b.orderNo === undefined ? Number.MAX_VALUE : b.orderNo;
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.lobt.localeCompare(b.lobt);
    });

  const result: LobtLeaderboardEntry[] = [];
  const limit = Math.min(topCount, sorted.length);

  for (let i = 0; i < limit; i++) {
    result.push({
      rank: i + 1,
      lobt: sorted[i].lobt,
      playerCount: sorted[i].playerCount ?? 0,
      xp: sorted[i].xp
    });
  }

  return result;
}

function buildLobtRankingFromUsers(rows: UsersListRow[], topCount: number): LobtLeaderboardEntry[] {
  const totalsByLobt: Array<{ lobt: string; xp: number; playerCount: number }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lobt = row.lobt.trim();

    if (!lobt) {
      continue;
    }

    let found = false;
    for (let j = 0; j < totalsByLobt.length; j++) {
      if (totalsByLobt[j].lobt === lobt) {
        totalsByLobt[j].xp += row.totalXp;
        totalsByLobt[j].playerCount += 1;
        found = true;
        break;
      }
    }

    if (!found) {
      totalsByLobt.push({ lobt, xp: row.totalXp, playerCount: 1 });
    }
  }

  return buildLobtRankingFromTotals(totalsByLobt, topCount);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeLobt(value: string): string {
  return value.trim();
}

export function resolveUserLeaderboardStatus(
  email: string,
  userLobt: string,
  individualTopRows: UsersListRow[],
  lobtTotals: Array<{ lobt: string; xp: number; orderNo?: number; playerCount?: number }>,
  individualTopLimit: number,
  lobtTopLimit: number,
  checkedAt: string = new Date().toISOString().slice(0, 10)
): UserLeaderBoardData {
  const normalizedEmail = normalizeEmail(email);
  let individualRank: number | undefined;

  for (let i = 0; i < individualTopRows.length; i++) {
    if (normalizeEmail(individualTopRows[i].email) === normalizedEmail) {
      individualRank = i + 1;
      break;
    }
  }

  const normalizedUserLobt = normalizeLobt(userLobt);
  const lobtRanked = buildLobtRankingFromTotals(lobtTotals, lobtTotals.length);
  let lobtRank: number | undefined;

  for (let i = 0; i < lobtRanked.length; i++) {
    if (normalizeLobt(lobtRanked[i].lobt) === normalizedUserLobt) {
      lobtRank = lobtRanked[i].rank;
      break;
    }
  }

  const inTop50 = individualRank !== undefined && individualRank <= individualTopLimit;
  const inTop10 = lobtRank !== undefined && lobtRank <= lobtTopLimit;

  return {
    individual: {
      inTop50,
      ...(inTop50 && individualRank !== undefined ? { rank: individualRank } : {})
    },
    lobt: {
      inTop10,
      ...(normalizedUserLobt ? { lobt: normalizedUserLobt } : {}),
      ...(inTop10 && lobtRank !== undefined ? { rank: lobtRank } : {})
    },
    checkedAt
  };
}

export interface LeaderBoardDataListUpdate {
  listItemId: number;
  data: UserLeaderBoardData;
}

/** Build LeaderBoardData payloads for each user in the individual top-N set. */
export function buildLeaderBoardDataForTopIndividualUsers(
  individualTopRows: UsersListRow[],
  lobtTotals: Array<{ lobt: string; xp: number; orderNo?: number; playerCount?: number }>,
  individualTopLimit: number,
  lobtTopLimit: number,
  checkedAt: string = new Date().toISOString().slice(0, 10)
): LeaderBoardDataListUpdate[] {
  const updates: LeaderBoardDataListUpdate[] = [];

  for (let i = 0; i < individualTopRows.length; i++) {
    const row = individualTopRows[i];
    if (!row.id) {
      continue;
    }

    updates.push({
      listItemId: row.id,
      data: resolveUserLeaderboardStatus(
        row.email,
        row.lobt,
        individualTopRows,
        lobtTotals,
        individualTopLimit,
        lobtTopLimit,
        checkedAt
      )
    });
  }

  return updates;
}
