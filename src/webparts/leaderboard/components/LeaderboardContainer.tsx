import * as React from 'react';

import type { ILeaderboardService } from '../ILeaderboardService';
import { ensureFrancoisOneFont } from '../leaderboardFont';
import type { LeaderboardData, LeaderboardTab } from '../leaderboardTypes';
import Leaderboard, { type LeaderboardViewStatus } from './Leaderboard';

export interface ILeaderboardContainerProps {
  loadLeaderboard: () => Promise<LeaderboardData>;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: LeaderboardData }
  | { status: 'error' };

const LeaderboardContainer: React.FC<ILeaderboardContainerProps> = ({ loadLeaderboard }) => {
  const [state, setState] = React.useState<LoadState>({ status: 'loading' });
  const [activeTab, setActiveTab] = React.useState<LeaderboardTab>('individual');

  React.useEffect(() => {
    ensureFrancoisOneFont();
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    setState({ status: 'loading' });

    loadLeaderboard()
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'ready', data });
        }
      })
      .catch((error: unknown) => {
        console.error('[Leaderboard] Failed to load rankings.', error);
        if (!cancelled) {
          setState({ status: 'error' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadLeaderboard, activeTab]);

  const viewStatus: LeaderboardViewStatus = state.status;

  return (
    <Leaderboard
      status={viewStatus}
      data={state.status === 'ready' ? state.data : undefined}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export function createLeaderboardLoader(services: ILeaderboardService[]): () => Promise<LeaderboardData> {
  return async () => {
    for (const service of services) {
      try {
        return await service.loadLeaderboard();
      } catch (error) {
        console.warn('[Leaderboard] Data source failed, trying next provider.', error);
      }
    }

    throw new Error('[Leaderboard] All data sources failed.');
  };
}

export default LeaderboardContainer;
