const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function connect() {
  if (!client.isOpen) {
    await client.connect();
  }
}

module.exports = {
  client,
  connect,
  get: async (key) => await client.get(key),
  set: async (key, value, options) => await client.set(key, value, options),
  incr: async (key) => await client.incr(key)
};
