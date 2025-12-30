/**
 * Basic test to verify Jest setup
 */

describe('Basic Jest Setup', () => {
  test('Jest is working', () => {
    expect(1 + 1).toBe(2);
  });

  test('fast-check is available', () => {
    const fc = require('fast-check');
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe('function');
  });
});