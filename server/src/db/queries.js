import db from './connection.js';

/**
 * EXPLAIN QUERY PLAN Output (against seeded dataset with idx_events_video_type):
 * -----------------------------------------------------------------------------
 * 1. MATERIALIZE agg
 * 2. SCAN engagement_events USING COVERING INDEX idx_events_video_type
 * 3. SCAN v USING INDEX idx_videos_product_id
 * 4. SEARCH p USING INTEGER PRIMARY KEY (rowid=?)
 * 5. BLOOM FILTER ON agg (video_id=?)
 * 6. SEARCH agg USING AUTOMATIC COVERING INDEX (video_id=?) LEFT-JOIN
 * 7. USE TEMP B-TREE FOR ORDER BY
 * -----------------------------------------------------------------------------
 * Aggregation Strategy:
 * Subquery conditional aggregation (`SUM(CASE WHEN event_type = ... THEN 1 ELSE 0 END)`)
 * scans engagement_events in a single pass using the composite covering index `(video_id, event_type)`.
 * A naive multi-JOIN (joining engagement_events 3 times for views, clicks, carts) would cause a
 * Cartesian product multiplier (e.g. 20 views * 10 clicks * 5 carts = 1,000 intermediate rows per video).
 */
export function getPaginatedVideoAnalytics(page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const countStmt = db.prepare('SELECT COUNT(*) AS total FROM videos');
  const { total } = countStmt.get();

  const dataStmt = db.prepare(`
    SELECT 
      v.id,
      v.title,
      v.video_url,
      v.product_id,
      p.name AS product_name,
      p.price AS product_price,
      COALESCE(agg.views, 0) AS views,
      COALESCE(agg.clicks, 0) AS clicks,
      COALESCE(agg.add_to_cart, 0) AS add_to_cart
    FROM videos v
    INNER JOIN products p ON v.product_id = p.id
    LEFT JOIN (
      SELECT 
        video_id,
        SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) AS clicks,
        SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS add_to_cart
      FROM engagement_events
      GROUP BY video_id
    ) agg ON v.id = agg.video_id
    ORDER BY agg.views DESC, v.id ASC
    LIMIT ? OFFSET ?
  `);

  const data = dataStmt.all(limitNum, offset);
  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    data,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages
  };
}

/**
 * Find a single video by ID.
 */
export function getVideoById(id) {
  const stmt = db.prepare('SELECT * FROM videos WHERE id = ?');
  return stmt.get(id);
}

/**
 * Insert a new engagement event.
 */
export function createEngagementEvent(videoId, eventType) {
  const stmt = db.prepare(`
    INSERT INTO engagement_events (video_id, event_type, timestamp)
    VALUES (?, ?, DATETIME('now'))
  `);
  const info = stmt.run(videoId, eventType);

  const getCreatedStmt = db.prepare(`
    SELECT id, video_id AS videoId, event_type AS eventType, timestamp
    FROM engagement_events
    WHERE id = ?
  `);
  return getCreatedStmt.get(info.lastInsertRowid);
}

/**
 * Fetch overall aggregated metrics dashboard header summary.
 */
export function getOverallAnalyticsSummary() {
  const stmt = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM products) AS total_products,
      (SELECT COUNT(*) FROM videos) AS total_videos,
      COALESCE(SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END), 0) AS total_views,
      COALESCE(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END), 0) AS total_clicks,
      COALESCE(SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END), 0) AS total_add_to_cart
    FROM engagement_events
  `);
  return stmt.get();
}

/**
 * Get all video IDs for random traffic simulation.
 */
export function getAllVideoIds() {
  const stmt = db.prepare('SELECT id FROM videos');
  return stmt.all().map(row => row.id);
}
