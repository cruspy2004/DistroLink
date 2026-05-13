const { toBase62 } = require('../../src/services/codegen');

describe('Base62 Encoder', () => {
  it('encodes 0 correctly', () => {
    expect(toBase62(0)).toBe('000000');
  });

  it('encodes positive integers correctly', () => {
    expect(toBase62(1)).toBe('000001');
    expect(toBase62(61)).toBe('00000Z');
    expect(toBase62(62)).toBe('000010');
  });
});
