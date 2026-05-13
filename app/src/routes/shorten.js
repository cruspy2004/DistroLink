const express = require('express');
const router = express.Router();
const codegen = require('../services/codegen');
const db = require('../services/db');
const clock = require('../services/clock');
const election = require('../services/election');

router.post('/', async (req, res) => {
  try {
    const ts = clock.tick();
    const { url } = req.body;
    
    const shortCode = await codegen.generateShortCode(url);
    
    await db.query(
      'INSERT INTO event_log (node_id, event_type, short_code, lamport_ts) VALUES ($1, $2, $3, $4)',
      [election.getNodeId(), 'shorten', shortCode, ts]
    );

    const protocol = req.protocol;
    const host = req.get('host');
    const shortUrl = `${protocol}://${host}/${shortCode}`;

    res.json({ short_url: shortUrl, code: shortCode });
  } catch (error) {
    console.error('Shorten error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
