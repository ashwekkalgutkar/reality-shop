import db from './connection.js';

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      video_url TEXT NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS engagement_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      event_type TEXT CHECK(event_type IN ('view', 'click', 'add_to_cart')) NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_videos_product_id ON videos(product_id);
    CREATE INDEX IF NOT EXISTS idx_events_video_id ON engagement_events(video_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON engagement_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_video_type ON engagement_events(video_id, event_type);
  `);
}

// Execute if run directly
if (process.argv[1]?.endsWith('migrate.js')) {
  runMigrations();
  console.log('Database migrations executed successfully.');
}
