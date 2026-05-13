const cache = require('./cache');
const nodeId = process.env.NODE_ID || '1';
let isLeader = false;

async function electLeader() {
  try {
    await cache.connect();
    const currentLeader = await cache.get('leader');
    if (!currentLeader) {
      const success = await cache.client.set('leader', nodeId, { NX: true, EX: 10 });
      isLeader = !!success;
    } else if (currentLeader === nodeId) {
      isLeader = true;
      await cache.client.set('leader', nodeId, { EX: 10 });
    } else {
      isLeader = false;
    }
  } catch (err) {
    console.error('Election error:', err);
  }
}

setInterval(electLeader, 5000);

module.exports = {
  isLeader: () => isLeader,
  getNodeId: () => nodeId,
  electLeader
};
