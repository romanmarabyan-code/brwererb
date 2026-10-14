// GD2-7 — remember the chosen repository between visits, per workspace.
//
// One key per workspace: somebody who switches between two workspaces follows
// different repositories in each, and a single key handed the second workspace
// a repository it cannot even show.
const PREFIX = 'gh.report.repository';

export const keyFor = (workspaceId) => `${PREFIX}.${workspaceId}`;

export const readRepository = (workspaceId) => {
  try {
    return window.localStorage.getItem(keyFor(workspaceId)) || null;
  } catch (e) {
    // Private windows throw on access; a forgotten filter is not an error.
    return null;
  }
};

export const writeRepository = (workspaceId, value) => {
  try {
    if (value) window.localStorage.setItem(keyFor(workspaceId), value);
    else window.localStorage.removeItem(keyFor(workspaceId));
  } catch (e) {
    /* nothing to do: the filter simply will not be remembered */
  }
};
