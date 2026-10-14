import { MAX_IDS, hasSeen, markSeen, reset } from '../src/delivery-log';

beforeEach(() => reset());

test('an unseen delivery is not a redelivery', () => {
  expect(hasSeen('d-1')).toBe(false);
});

test('a marked delivery is recognised on the retry', () => {
  markSeen('d-1');
  expect(hasSeen('d-1')).toBe(true);
});

test('the log stays bounded and evicts the oldest id', () => {
  for (let i = 0; i <= MAX_IDS; i += 1) markSeen(`d-${i}`);

  expect(hasSeen('d-0')).toBe(false);
  expect(hasSeen(`d-${MAX_IDS}`)).toBe(true);
});
