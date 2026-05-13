CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  hit_count INTEGER DEFAULT 0
);

CREATE TABLE event_log (
  id SERIAL PRIMARY KEY,
  node_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  short_code VARCHAR(10),
  lamport_ts INTEGER NOT NULL,
  wall_clock_ts TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_event_log_lamport_ts ON event_log(lamport_ts);
