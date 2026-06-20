import * as React from 'react';
import styles from './Leaderboard.module.scss';
import type { IndividualLeaderboardEntry, LeaderboardData, LeaderboardTab, LobtLeaderboardEntry } from '../leaderboardTypes';

export type LeaderboardViewStatus = 'loading' | 'ready' | 'error';

interface ITableStateRowProps {
  colSpan: number;
  message: string;
}

const TableStateRow: React.FC<ITableStateRowProps> = ({ colSpan, message }) => (
  <tr>
    <td className={styles.tableStateCell} colSpan={colSpan}>
      <span className={styles.tableStateMessage}>{message}</span>
    </td>
  </tr>
);

interface IIndividualTableProps {
  rows: IndividualLeaderboardEntry[];
  status: LeaderboardViewStatus;
}

const IndividualTable: React.FC<IIndividualTableProps> = ({ rows, status }) => (
<>
  <p className={styles.subtitle}>TOP 20 RANKING</p>
  <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rankHeader} aria-label="Rank" />
            <th>Name</th>
            <th>LOBT</th>
            <th className={styles.xpHeader}>XP</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' && (
            <TableStateRow colSpan={4} message="Loading leaderboard..." />
          )}
          {status === 'error' && (
            <TableStateRow
              colSpan={4}
              message="Unable to load leaderboard data. Please refresh the page or try again later."
            />
          )}
          {status === 'ready' && rows.map((row) => (
            <tr key={`individual-${row.rank}`}>
              <td className={styles.rankCell}>
                <span className={styles.rankBadge}>{row.rank}</span>
              </td>
              <td>{row.name}</td>
              <td>{row.lobt}</td>
              <td className={styles.xpCell}>{row.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rankHeader} aria-label="Rank" />
            <th>LOBT</th>
            <th className={styles.xpHeader}>XP</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' && (
            <TableStateRow colSpan={3} message="Loading leaderboard..." />
          )}
          {status === 'error' && (
            <TableStateRow
              colSpan={3}
              message="Unable to load leaderboard data. Please refresh the page or try again later."
            />
          )}
          {status === 'ready' && rows.map((row) => (
            <tr key={`lobt-${row.rank}`}>
              <td className={styles.rankCell}>
                <span className={styles.rankBadge}>{row.rank}</span>
              </td>
              <td>{row.lobt}</td>
              <td className={styles.xpCell}>{row.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
