import { readRepository, writeRepository } from '../src/filter-memory';

test('a written repository is read back', () => {
  writeRepository('romanmarabyan-code/brwererb');
  expect(readRepository()).toBe('romanmarabyan-code/brwererb');
});

test('clearing the filter forgets it', () => {
  writeRepository(null);
  expect(readRepository()).toBeNull();
});
