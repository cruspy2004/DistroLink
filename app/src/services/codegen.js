const db = require('./db');
const cache = require('./cache');

function toBase62(n) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  if (n === 0) return "000000";
  while (n > 0) {
    result = chars[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result.padStart(6, '0');
}

async function acquireLock(lockKey, timeout) {
  return await cache.client.set(lockKey, "LOCKED", { NX: true, PX: timeout });
}

async function releaseLock(lockKey) {
  await cache.client.del(lockKey);
}

async function generateShortCode(originalUrl) {
  // Check if URL already exists
  const existing = await db.query('SELECT short_code FROM urls WHERE original = $1', [originalUrl]);
  if (existing.rows.length > 0) {
    return existing.rows[0].short_code;
  }

  const lockKey = "lock:codegen";
  let locked = false;

  for (let i = 0; i < 10; i++) {
    locked = await acquireLock(lockKey, 2000);
    if (locked) break;
    await new Promise(r => setTimeout(r, 50));
  }

  if (!locked) {
    throw new Error("Could not acquire codegen lock");
  }

  try {
    // Re-check after lock acquired
    const existingAgain = await db.query('SELECT short_code FROM urls WHERE original = $1', [originalUrl]);
    if (existingAgain.rows.length > 0) {
      return existingAgain.rows[0].short_code;
    }

    const tempCode = 'T' + Math.random().toString(36).substring(2, 10).padEnd(8, '0');
    const { rows } = await db.query('INSERT INTO urls (short_code, original) VALUES ($1, $2) RETURNING id', [tempCode, originalUrl]);
    const id = rows[0].id;
    const shortCode = toBase62(id);
    
    await db.query('UPDATE urls SET short_code = $1 WHERE id = $2', [shortCode, id]);
    await cache.client.set(`url:${shortCode}`, originalUrl, { EX: 86400 });
    
    return shortCode;
  } finally {
    await releaseLock(lockKey);
  }
}

module.exports = {
  toBase62,
  generateShortCode
};
