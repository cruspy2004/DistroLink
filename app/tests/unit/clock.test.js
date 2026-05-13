const LamportClock = require('../../src/services/clock').constructor;

describe('Lamport Clock', () => {
  let clock;

  beforeEach(() => {
    clock = new LamportClock();
  });

  it('ticks correctly', () => {
    const time1 = clock.tick();
    expect(time1).toBe(1);
    const time2 = clock.tick();
    expect(time2).toBe(2);
  });

  it('updates correctly on receiving higher time', () => {
    clock.time = 5;
    const time = clock.update(10);
    expect(time).toBe(11);
    expect(clock.time).toBe(11);
  });
});
