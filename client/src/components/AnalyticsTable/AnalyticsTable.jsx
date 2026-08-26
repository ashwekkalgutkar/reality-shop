import React from 'react';
import { ShoppingBag, ExternalLink, Film, AlertCircle } from 'lucide-react';
import styles from './AnalyticsTable.module.css';

/**
 * Calculates conversion rate client-side: (add_to_cart / views).
 * Gracefully handles divide-by-zero by returning '—'.
 */
function getConversionRate(addToCart, views) {
  const viewsNum = Number(views);
  const cartNum = Number(addToCart);

  if (!Number.isFinite(viewsNum) || viewsNum <= 0) {
    return { text: '—', value: null, className: styles.emptyConversion };
  }

  const validCart = (!Number.isFinite(cartNum) || cartNum < 0) ? 0 : cartNum;
  const rate = (validCart / viewsNum) * 100;

  if (!Number.isFinite(rate)) {
    return { text: '—', value: null, className: styles.emptyConversion };
  }

  const formattedText = `${rate.toFixed(1)}%`;

  let pillClass = styles.lowConversion;
  if (rate >= 15) {
    pillClass = styles.highConversion;
  } else if (rate >= 5) {
    pillClass = styles.mediumConversion;
  }

  return { text: formattedText, value: rate, className: pillClass };
}

export function AnalyticsTable({ data, loading, isRefetching }) {
  if (loading && (!data || data.length === 0)) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Video Title</th>
                <th>Product</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Add to Carts</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><div className={styles.skeleton} style={{ width: '80%' }} /></td>
                  <td><div className={styles.skeleton} style={{ width: '60%' }} /></td>
                  <td><div className={styles.skeleton} style={{ width: '40px' }} /></td>
                  <td><div className={styles.skeleton} style={{ width: '40px' }} /></td>
                  <td><div className={styles.skeleton} style={{ width: '40px' }} /></td>
                  <td><div className={styles.skeleton} style={{ width: '65px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <AlertCircle size={32} color="var(--text-muted)" />
          <span className={styles.emptyTitle}>No Analytics Data Found</span>
          <p>Run the seed script or use the Simulate Traffic tool to generate events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.tableContainer} ${isRefetching ? styles.refetching : ''}`}>
      {isRefetching && (
        <div className={styles.topProgressBar}>
          <div className={styles.progressGlow} />
        </div>
      )}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Video Title</th>
              <th>Product</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>Add to Carts</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const conversion = getConversionRate(row.add_to_cart, row.views);
              return (
                <tr key={row.id}>
                  <td>
                    <div className={styles.videoCell}>
                      <div className={styles.videoTitle}>{row.title}</div>
                      <a
                        href={row.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.videoUrl}
                        title="Open sample media asset"
                      >
                        <Film size={12} />
                        <span>Media Asset #{row.id}</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className={styles.productBadge}>
                      <ShoppingBag size={12} color="var(--accent-primary)" />
                      <span>{row.product_name}</span>
                      <span className={styles.productPrice}>(${Number(row.product_price).toFixed(2)})</span>
                    </div>
                  </td>
                  <td className={styles.metricValue}>{Number(row.views).toLocaleString()}</td>
                  <td className={styles.metricValue}>{Number(row.clicks).toLocaleString()}</td>
                  <td className={styles.metricValue}>{Number(row.add_to_cart).toLocaleString()}</td>
                  <td>
                    <span className={`${styles.conversionPill} ${conversion.className}`}>
                      {conversion.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
