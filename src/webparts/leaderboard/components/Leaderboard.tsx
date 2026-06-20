import * as React from 'react';
import styles from './Leaderboard.module.scss';
import type { IndividualLeaderboardEntry, LeaderboardData, LeaderboardTab, LobtLeaderboardEntry } from '../leaderboardTypes';

export type LeaderboardViewStatus = 'loading' | 'ready' | 'error';

interface ITableStateRowProps {
  message: string;
}

const TableStateRow: React.FC<ITableStateRowProps> = ({ message }) => (
  <div className={styles.tableRow}>
    <div className={`${styles.tableCell} ${styles.tableStateCell}`}>
      <span className={styles.tableStateMessage}>{message}</span>
    </div>
  </div>
);

interface IIndividualTableProps {
  rows: IndividualLeaderboardEntry[];
  status: LeaderboardViewStatus;
}

const IndividualTable: React.FC<IIndividualTableProps> = ({ rows, status }) => (
  <>
    <p className={styles.subtitle}>TOP 20 RANKING</p>
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={styles.tableHead}>
          <div className={styles.tableRow}>
            <div className={`${styles.tableCell} ${styles.colRank}`} aria-label="Rank" />
            <div className={`${styles.tableCell} ${styles.colName}`}>Name</div>
            <div className={`${styles.tableCell} ${styles.colLobt}`}>LOBT</div>
            <div className={`${styles.tableCell} ${styles.colXp}`}>XP</div>
          </div>
        </div>
        <div className={styles.tableBody}>
          {status === 'loading' && (
            <TableStateRow message="Loading leaderboard..." />
          )}
          {status === 'error' && (
            <TableStateRow message="Unable to load leaderboard data. Please refresh the page or try again later." />
          )}
          {status === 'ready' && rows.map((row) => (
            <div className={styles.tableRow} key={`individual-${row.rank}`}>
              <div className={`${styles.tableCell} ${styles.colRank}`}>
                <span className={styles.rankBadge}>{row.rank}</span>
              </div>
              <div className={`${styles.tableCell} ${styles.colName}`}>{row.name}</div>
              <div className={`${styles.tableCell} ${styles.colLobt}`}>{row.lobt}</div>
              <div className={`${styles.tableCell} ${styles.colXp}`}>{row.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

interface ILobtTableProps {
  rows: LobtLeaderboardEntry[];
  status: LeaderboardViewStatus;
}

const LobtTable: React.FC<ILobtTableProps> = ({ rows, status }) => (
  <>
    <p className={styles.subtitle}>TOP 5 RANKING</p>
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={styles.tableHead}>
          <div className={styles.tableRow}>
            <div className={`${styles.tableCell} ${styles.colRank}`} aria-label="Rank" />
            <div className={`${styles.tableCell} ${styles.colLobtTab}`}>LOBT</div>
            <div className={`${styles.tableCell} ${styles.colPlayerCount}`}>Players</div>
            <div className={`${styles.tableCell} ${styles.colXpLobt}`}>XP</div>
          </div>
        </div>
        <div className={styles.tableBody}>
          {status === 'loading' && (
            <TableStateRow message="Loading leaderboard..." />
          )}
          {status === 'error' && (
            <TableStateRow message="Unable to load leaderboard data. Please refresh the page or try again later." />
          )}
          {status === 'ready' && rows.map((row) => (
            <div className={styles.tableRow} key={`lobt-${row.rank}`}>
              <div className={`${styles.tableCell} ${styles.colRank}`}>
                <span className={styles.rankBadge}>{row.rank}</span>
              </div>
              <div className={`${styles.tableCell} ${styles.colLobtTab}`}>{row.lobt}</div>
              <div className={`${styles.tableCell} ${styles.colPlayerCount}`}>{row.playerCount}</div>
              <div className={`${styles.tableCell} ${styles.colXpLobt}`}>{row.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export interface ILeaderboardProps {
  status: LeaderboardViewStatus;
  data?: LeaderboardData;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const Leaderboard: React.FC<ILeaderboardProps> = ({
  status,
  data,
  showCloseButton = false,
  onClose
}) => {
  const [activeTab, setActiveTab] = React.useState<LeaderboardTab>('individual');

  const individualRows = data?.individual || [];
  const lobtRows = data?.lobt || [];
  const hasScroll = status === 'ready' && (
    activeTab === 'individual'
      ? individualRows.length > 4
      : lobtRows.length > 4
  );

  return (
    <div className={styles.leaderboardRoot}>
      <div className={styles.panel}>

        <div className={styles.headerRibbon}>
          <figure className={styles.crown} aria-hidden="true">
            <img src={require('../assets/img_crown.png')} alt="Crown" />
          </figure>
          <span className={styles.headerTitle}>LEADERBOARD</span>
        </div>

        <div className={styles.panel__inner}>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close leaderboard"
              onClick={onClose}
            >
              <img src={require('../assets/img_closeBtn.png')} alt="Close" />
            </button>

          

          <div className={styles.tabRow}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'individual' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              INDIVIDUAL
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'lobt' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('lobt')}
            >
              LOBT
            </button>
          </div>

          {activeTab === 'individual' ? (
            <IndividualTable rows={individualRows} status={status} />
          ) : (
            <LobtTable rows={lobtRows} status={status} />
          )}

          {hasScroll && <div className={styles.scrollIndicator} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
