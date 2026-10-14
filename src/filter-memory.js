// GD2-7 — remember the chosen repository between visits.
const KEY = 'gh.report.repository';

export const readRepository = () => {
  try {
    return window.localStorage.getItem(KEY) || null;
  } catch (e) {
    // Private windows throw on access; a forgotten filter is not an error.
    return null;
  }
};

export const writeRepository = (value) => {
  try {
    if (value) window.localStorage.setItem(KEY, value);
    else window.localStorage.removeItem(KEY);
  } catch (e) {
    /* nothing to do: the filter simply will not be remembered */
  }
};
