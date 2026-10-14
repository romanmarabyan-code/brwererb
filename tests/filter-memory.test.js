import { keyFor, readRepository, writeRepository } from '../src/filter-memory';

test('the key carries the workspace', () => {
  expect(keyFor(106939)).toBe('gh.report.repository.106939');
});

test('a written repository is read back in the same workspace', () => {
  writeRepository(106939, 'romanmarabyan-code/brwererb');
  expect(readRepository(106939)).toBe('romanmarabyan-code/brwererb');
});

test('another workspace does not see it', () => {
  writeRepository(106939, 'romanmarabyan-code/brwererb');
  expect(readRepository(458969)).toBeNull();
});

test('clearing the filter forgets it', () => {
  writeRepository(106939, null);
  expect(readRepository(106939)).toBeNull();
});
