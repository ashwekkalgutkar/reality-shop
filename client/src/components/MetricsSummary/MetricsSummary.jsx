import React from 'react';
import { Eye, MousePointerClick, ShoppingBag, TrendingUp } from 'lucide-react';
import styles from './MetricsSummary.module.css';

export function MetricsSummary({ summary, loading }) {
  const isInitialLoading = !summary && loading;
  const totalViews = summary?.total_views ?? 0;
  const totalClicks = summary?.total_clicks ?? 0;
  const totalCarts = summary?.total_add_to_cart ?? 0;

  const avgConversion = totalViews > 0
    ? ((totalCarts / totalViews) * 100).toFixed(1) + '%'
    : '—';

  return (
    <div className={styles.summaryGrid}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardLabel}>Total Video Views</span>
          <div className={`${styles.iconWrapper} ${styles.iconView}`}>
            <Eye size={16} />
          </div>
        </div>
        <div className={styles.cardValue}>
          {isInitialLoading ? '...' : totalViews.toLocaleString()}
        </div>
        <span className={styles.cardSubtext}>Across all active videos</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardLabel}>Total Product Clicks</span>
          <div className={`${styles.iconWrapper} ${styles.iconClick}`}>
            <MousePointerClick size={16} />
          </div>
        </div>
        <div className={styles.cardValue}>
          {isInitialLoading ? '...' : totalClicks.toLocaleString()}
        </div>
        <span className={styles.cardSubtext}>Interactive overlay taps</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardLabel}>Add to Carts</span>
          <div className={`${styles.iconWrapper} ${styles.iconCart}`}>
            <ShoppingBag size={16} />
          </div>
        </div>
        <div className={styles.cardValue}>
          {isInitialLoading ? '...' : totalCarts.toLocaleString()}
        </div>
        <span className={styles.cardSubtext}>Completed purchase intents</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardLabel}>Avg Conversion Rate</span>
          <div className={`${styles.iconWrapper} ${styles.iconRate}`}>
            <TrendingUp size={16} />
          </div>
        </div>
        <div className={styles.cardValue}>
          {isInitialLoading ? '...' : avgConversion}
        </div>
        <span className={styles.cardSubtext}>Cart adds per total view</span>
      </div>
    </div>
  );
}
