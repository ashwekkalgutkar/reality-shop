import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange }) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  
  const startItem = total === 0 ? 0 : Math.min((safePage - 1) * limit + 1, total);
  const endItem = Math.min(safePage * limit, total);

  return (
    <div className={styles.paginationBar}>
      <div className={styles.summaryText}>
        Showing <span className={styles.strong}>{startItem}</span>–<span className={styles.strong}>{endItem}</span> of{' '}
        <span className={styles.strong}>{total}</span> videos
      </div>

      <div className={styles.controlsGroup}>
        <div className={styles.limitSelector}>
          <label htmlFor="limitSelect">Rows per page:</label>
          <select
            id="limitSelect"
            className={styles.select}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className={styles.navButtons}>
          <button
            className={styles.btn}
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <span className={styles.pageIndicator}>
            Page <span className={styles.strong}>{total === 0 ? 0 : safePage}</span> of{' '}
            <span className={styles.strong}>{total === 0 ? 0 : safeTotalPages}</span>
          </span>

          <button
            className={styles.btn}
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= safeTotalPages || total === 0}
            aria-label="Next Page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
