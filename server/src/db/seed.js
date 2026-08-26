import db from './connection.js';
import { runMigrations } from './migrate.js';

export function seedDatabase() {
  // Ensure tables exist
  runMigrations();

  console.log('Seeding database with realistic sample data...');

  const seedTransaction = db.transaction(() => {
    // Clear existing data for idempotency
    db.prepare('DELETE FROM engagement_events').run();
    db.prepare('DELETE FROM videos').run();
    db.prepare('DELETE FROM products').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('products', 'videos', 'engagement_events')").run();

    // 1. Insert 8 Products
    const insertProduct = db.prepare(`
      INSERT INTO products (name, price, created_at)
      VALUES (?, ?, DATETIME('now', ?))
    `);

    const products = [
      { name: 'Apex Pulse Smartwatch', price: 199.99, offset: '-30 days' },
      { name: 'Aura Studio Wireless Earbuds', price: 149.50, offset: '-28 days' },
      { name: 'Tactile Pro Mechanical Keyboard', price: 129.00, offset: '-25 days' },
      { name: 'Vanguard Leather Backpack', price: 89.95, offset: '-22 days' },
      { name: 'Horizon 4K Action Cam', price: 249.00, offset: '-20 days' },
      { name: 'Artisan Ceramic Coffee Mug', price: 24.50, offset: '-18 days' },
      { name: 'Lumina RGB Desk Bar', price: 45.00, offset: '-15 days' },
      { name: 'HyperCharge 100W GaN Adapter', price: 39.99, offset: '-12 days' }
    ];

    const productIds = [];
    for (const p of products) {
      const info = insertProduct.run(p.name, p.price, p.offset);
      productIds.push(info.lastInsertRowid);
    }

    // 2. Insert 15 Videos
    const insertVideo = db.prepare(`
      INSERT INTO videos (product_id, video_url, title)
      VALUES (?, ?, ?)
    `);

    const videoTemplates = [
      { pIdx: 0, title: 'Unboxing Apex Pulse: Heart Rate & Sleep Tracker Test', url: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smart-watch-41484-large.mp4' },
      { pIdx: 0, title: 'Apex Pulse 30-Day Fitness Challenge Review', url: 'https://assets.mixkit.co/videos/preview/mixkit-man-checking-his-smart-watch-while-running-43542-large.mp4' },
      { pIdx: 1, title: 'Aura Studio Earbuds: Real Noise Cancellation Test', url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-putting-on-wireless-earphones-43285-large.mp4' },
      { pIdx: 1, title: 'Sound Quality Comparison: Aura Studio vs Competitors', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-listening-to-music-with-headphones-40018-large.mp4' },
      { pIdx: 2, title: 'Tactile Pro ASMR Typing Sound Test & Keycap Customization', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-computer-keyboard-41380-large.mp4' },
      { pIdx: 2, title: 'Desk Tour: Why Mechanical Keyboards Boost Productivity', url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-typing-on-a-keyboard-41551-large.mp4' },
      { pIdx: 3, title: 'What Fits in the Vanguard Leather Backpack?', url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-with-a-backpack-in-the-city-43187-large.mp4' },
      { pIdx: 3, title: 'Vanguard Backpack Waterproof Test & Durability Walkthrough', url: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-nature-with-a-backpack-43553-large.mp4' },
      { pIdx: 4, title: 'Filming Mountain Biking in 4K with Horizon Action Cam', url: 'https://assets.mixkit.co/videos/preview/mixkit-man-riding-a-mountain-bike-downhill-42797-large.mp4' },
      { pIdx: 4, title: 'Horizon 4K Action Cam Stabilization & Slow-Mo Showcase', url: 'https://assets.mixkit.co/videos/preview/mixkit-surfer-riding-a-wave-in-slow-motion-41544-large.mp4' },
      { pIdx: 5, title: 'Morning Pour-Over Coffee in Artisan Ceramic Mug', url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-fresh-coffee-into-a-cup-41541-large.mp4' },
      { pIdx: 5, title: 'Behind the Scenes: Handcrafting Ceramic Pottery', url: 'https://assets.mixkit.co/videos/preview/mixkit-potter-shaping-a-clay-vase-on-a-wheel-42861-large.mp4' },
      { pIdx: 6, title: 'Ultimate RGB Desk Setup Upgrade with Lumina Bar', url: 'https://assets.mixkit.co/videos/preview/mixkit-neon-lights-in-a-dark-room-41539-large.mp4' },
      { pIdx: 6, title: 'Lumina RGB Ambient Sync with Screen Content', url: 'https://assets.mixkit.co/videos/preview/mixkit-gamer-playing-with-headphones-and-neon-lights-42999-large.mp4' },
      { pIdx: 7, title: 'HyperCharge 100W GaN Charging 3 Devices at Once', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-connecting-a-charging-cable-to-a-phone-41480-large.mp4' }
    ];

    const videoIds = [];
    for (const v of videoTemplates) {
      const pId = productIds[v.pIdx];
      const info = insertVideo.run(pId, v.url, v.title);
      videoIds.push(info.lastInsertRowid);
    }

    // 3. Insert ~220 Engagement Events with varied timestamps across 30 days
    const insertEvent = db.prepare(`
      INSERT INTO engagement_events (video_id, event_type, timestamp)
      VALUES (?, ?, DATETIME('now', ?))
    `);

    // Distribution weights per video (some popular, some mid-tier, some quiet)
    const videoWeights = [
      { vIdx: 0, views: 35, clicks: 14, add_to_cart: 8 },  // High conversion
      { vIdx: 1, views: 24, clicks: 8,  add_to_cart: 3 },
      { vIdx: 2, views: 28, clicks: 12, add_to_cart: 6 },
      { vIdx: 3, views: 18, clicks: 5,  add_to_cart: 2 },
      { vIdx: 4, views: 32, clicks: 15, add_to_cart: 9 },  // Popular ASMR
      { vIdx: 5, views: 14, clicks: 4,  add_to_cart: 1 },
      { vIdx: 6, views: 22, clicks: 9,  add_to_cart: 5 },
      { vIdx: 7, views: 12, clicks: 3,  add_to_cart: 1 },
      { vIdx: 8, views: 26, clicks: 11, add_to_cart: 6 },
      { vIdx: 9, views: 16, clicks: 6,  add_to_cart: 2 },
      { vIdx: 10, views: 20, clicks: 7, add_to_cart: 4 },
      { vIdx: 11, views: 10, clicks: 2, add_to_cart: 0 },  // 0 add-to-carts to test edge case
      { vIdx: 12, views: 30, clicks: 13, add_to_cart: 7 },
      { vIdx: 13, views: 15, clicks: 5,  add_to_cart: 2 },
      { vIdx: 14, views: 0,  clicks: 0,  add_to_cart: 0 }   // 0 views/events edge case for divide-by-zero test
    ];

    let totalInserted = 0;
    for (const w of videoWeights) {
      const vId = videoIds[w.vIdx];

      // Insert views
      for (let i = 0; i < w.views; i++) {
        const daysAgo = Math.floor(Math.random() * 28);
        const hoursAgo = Math.floor(Math.random() * 24);
        const offset = `-${daysAgo} days, -${hoursAgo} hours`;
        insertEvent.run(vId, 'view', offset);
        totalInserted++;
      }

      // Insert clicks
      for (let i = 0; i < w.clicks; i++) {
        const daysAgo = Math.floor(Math.random() * 28);
        const hoursAgo = Math.floor(Math.random() * 24);
        const offset = `-${daysAgo} days, -${hoursAgo} hours`;
        insertEvent.run(vId, 'click', offset);
        totalInserted++;
      }

      // Insert add_to_cart
      for (let i = 0; i < w.add_to_cart; i++) {
        const daysAgo = Math.floor(Math.random() * 28);
        const hoursAgo = Math.floor(Math.random() * 24);
        const offset = `-${daysAgo} days, -${hoursAgo} hours`;
        insertEvent.run(vId, 'add_to_cart', offset);
        totalInserted++;
      }
    }

    console.log(`Seeding complete: ${products.length} products, ${videoTemplates.length} videos, and ${totalInserted} engagement events created.`);
  });

  seedTransaction();
}

// Execute seed if run directly
if (process.argv[1]?.endsWith('seed.js')) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}
