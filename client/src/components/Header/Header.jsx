import React from 'react';
import { Video, RefreshCw } from 'lucide-react';
import styles from './Header.module.css';

export function Header({ onRefresh, isRefreshing }) {
  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <div className={styles.logoBadge}>
          <Video size={22} />
        </div>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Shoppable Video Analytics</h1>
          <span className={styles.subtitle}>Real-time performance tracking & event pipeline</span>
        </div>
      </div>

      <div className={styles.actionsGroup}>
        <div className={styles.statusIndicator}>
          <span className={styles.pulseDot}></span>
          <span>Live SQLite Sync</span>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh dataset"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
