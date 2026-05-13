const express = require('express');
const router = express.Router();
const db = require('../services/db');
const cache = require('../services/cache');
const clock = require('../services/clock');
const election = require('../services/election');

router.get('/:code', async (req, res) => {
  try {
    const ts = clock.tick();
    const code = req.params.code;

    // Check cache
    const cached = await cache.get(`url:${code}`);
    if (cached) {
      await db.query(
        'INSERT INTO event_log (node_id, event_type, short_code, lamport_ts) VALUES ($1, $2, $3, $4)',
        [election.getNodeId(), 'cache_hit', code, ts]
      );
      await cache.incr('stats:hits');
      res.set('X-Cache', 'HIT');
      res.set('X-Node-ID', election.getNodeId());
      
      db.query('UPDATE urls SET hit_count = hit_count + 1 WHERE short_code = $1', [code]).catch(console.error);
      
      return res.redirect(302, cached);
    }

    // Cache miss, check DB
    const { rows } = await db.query('SELECT original FROM urls WHERE short_code = $1', [code]);
    if (rows.length === 0) {
      return res.status(404).send('Not found');
    }

    const originalUrl = rows[0].original;
    await cache.client.set(`url:${code}`, originalUrl, { EX: 86400 });
    await cache.incr('stats:misses');
    
    await db.query(
      'INSERT INTO event_log (node_id, event_type, short_code, lamport_ts) VALUES ($1, $2, $3, $4)',
      [election.getNodeId(), 'cache_miss', code, ts]
    );

    db.query('UPDATE urls SET hit_count = hit_count + 1 WHERE short_code = $1', [code]).catch(console.error);

    res.set('X-Cache', 'MISS');
    res.set('X-Node-ID', election.getNodeId());
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
