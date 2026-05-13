const express = require('express');
const router = express.Router();
const db = require('../services/db');
const cache = require('../services/cache');
const election = require('../services/election');

router.get('/', async (req, res) => {
  try {
    const [urlsRes, hitsStr, missesStr] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM urls'),
      cache.get('stats:hits'),
      cache.get('stats:misses')
    ]);

    const totalUrls = parseInt(urlsRes.rows[0].count, 10);
    const hits = parseInt(hitsStr || '0', 10);
    const misses = parseInt(missesStr || '0', 10);
    const totalRequests = hits + misses;
    const hitRate = totalRequests === 0 ? '0%' : Math.round((hits / totalRequests) * 100) + '%';

    res.json({
      node_id: election.getNodeId(),
      is_leader: election.isLeader(),
      total_urls: totalUrls,
      cache_hits: hits,
      cache_misses: misses,
      cache_hit_rate: hitRate,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
