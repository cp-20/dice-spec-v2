expect.extend({
  closeTo: (received, expected, precision = 2) => {
    const pass = Math.abs(received - expected) < 10 ** -precision;
    const message = () => `expected ${received} to be close to ${expected} with precision ${precision}`;
    return { pass, message };
  },
});
