import React from 'react';
import { Video, RefreshCw, Youtube, PlayCircle } from 'lucide-react';
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
        <a
          href="https://youtu.be/WxFWAJp1G2Q"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
          title="Watch YouTube Pitch Video"
        >
          <Youtube size={14} className={styles.ytIcon} />
          <span>Pitch</span>
        </a>
        <a
          href="https://drive.google.com/file/d/1Z_3v2hFJWl_JRqzXFXSdmimZWdjjlecz/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
          title="Watch Video Walkthrough"
        >
          <PlayCircle size={14} className={styles.walkthroughIcon} />
          <span>Walkthrough</span>
        </a>
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

