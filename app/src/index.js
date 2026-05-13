const express = require('express');
const app = express();
const cache = require('./services/cache');
const election = require('./services/election');

const shortenRoute = require('./routes/shorten');
const redirectRoute = require('./routes/redirect');
const monitorRoute = require('./routes/monitor');
const { validateUrl } = require('./middleware/validate');

app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', node: election.getNodeId(), uptime: process.uptime() });
});

app.use('/api/shorten', validateUrl, shortenRoute);
app.use('/monitor', monitorRoute);
app.use('/', redirectRoute);

const PORT = process.env.PORT || 3000;

async function start() {
  await cache.connect();
  await election.electLeader();
  
  app.listen(PORT, () => {
    console.log(`Node ${election.getNodeId()} listening on port ${PORT}`);
  });
}

start().catch(console.error);
