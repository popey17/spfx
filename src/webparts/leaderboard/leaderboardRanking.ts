import type {
  IndividualLeaderboardEntry,
  LeaderboardData,
  LobtLeaderboardEntry,
  UsersListRow
} from './leaderboardTypes';

export function buildLeaderboardFromUsersRows(rows: UsersListRow[], topCount: number): LeaderboardData {
  return {
    individual: buildIndividualRanking(rows, topCount),
    lobt: buildLobtRankingFromUsers(rows, topCount)
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
