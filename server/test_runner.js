import db from './src/db/connection.js';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

async function runBackendTests() {
  console.log(`=== RUNNING BACKEND TESTS AGAINST ${BASE_URL} ===\n`);

  async function testReq(name, url, options = {}) {
    const res = await fetch(`${BASE_URL}${url}`, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch(e) { json = text; }
    return { name, status: res.status, body: json };
  }

  const results = [];

  // 1
  results.push(await testReq("1. Valid request", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: 1, eventType: "view" })
  }));

  // 2
  results.push(await testReq("2. Invalid videoId (99999)", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: 99999, eventType: "view" })
  }));

  // 3
  results.push(await testReq("3. Missing videoId", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType: "view" })
  }));

  // 4
  results.push(await testReq("4. Invalid eventType (purchase)", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: 1, eventType: "purchase" })
  }));

  // 5
  results.push(await testReq("5. Missing eventType", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: 1 })
  }));

  // 6
  results.push(await testReq("6. Malformed JSON body", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: "{ videoId: 1, eventType: "
  }));

  // 7
  results.push(await testReq("7. videoId as string 'abc'", "/api/events", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: "abc", eventType: "view" })
  }));

  // 8
  results.push(await testReq("8. Default call (no query params)", "/api/analytics/videos"));

  // 9
  results.push(await testReq("9. ?page=1&limit=5", "/api/analytics/videos?page=1&limit=5"));

  // 10
  results.push(await testReq("10. ?page=999&limit=5", "/api/analytics/videos?page=999&limit=5"));

  // 11a
  results.push(await testReq("11a. ?limit=0", "/api/analytics/videos?limit=0"));

  // 11b
  results.push(await testReq("11b. ?page=1&limit=-5", "/api/analytics/videos?page=1&limit=-5"));

  // Output formatting
  for (const r of results) {
    console.log(`--- ${r.name} ---`);
    console.log(`Status: ${r.status}`);
    console.log(`Body:\n${JSON.stringify(r.body, null, 2)}\n`);
  }

  // 12 & 13
  console.log(`--- 12 & 13. Zero Events Video & Exact Response Keys ---`);
  const insertStmt = db.prepare(`INSERT INTO videos (title, video_url, product_id) VALUES ('Zero Event Test Video', 'https://example.com/zero.mp4', 1)`);
  const info = insertStmt.run();
  const testVidId = info.lastInsertRowid;

  const res13 = await fetch(`${BASE_URL}/api/analytics/videos?page=1&limit=100`);
  const json13 = await res13.json();
  const zeroVid = json13.data.find(v => v.id === testVidId);
  console.log("Zero Events Video in Data:", JSON.stringify(zeroVid, null, 2));
  console.log("Response Keys:", Object.keys(json13));

  db.prepare(`DELETE FROM videos WHERE id = ?`).run(testVidId);

  // 14
  console.log(`\n--- 14. EXPLAIN QUERY PLAN ---`);
  const query = `
    EXPLAIN QUERY PLAN
    SELECT 
      v.id, v.title, v.video_url, v.product_id, p.name AS product_name, p.price AS product_price,
      COALESCE(agg.views, 0) AS views, COALESCE(agg.clicks, 0) AS clicks, COALESCE(agg.add_to_cart, 0) AS add_to_cart
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
    LIMIT 10 OFFSET 0
  `;
  const plan = db.prepare(query).all();
  console.log(JSON.stringify(plan, null, 2));
}

runBackendTests().catch(console.error);
