# Branch workflow

How work moves from a local branch into `main` in this repository.

## Naming

Branches are named `<TICKET>/<short-slug>`:

- `BER-2/fix`
- `WW-1234-login-fix` (older style, hyphen instead of slash — kept as-is)
- `feature/EVI-77_new-dashboard` (prefixed style, also grandfathered)

New branches should use the slash form. The existing remote branches are
left untouched rather than renamed, since renaming breaks any open PR.

## Commits

- Subject line: imperative mood, under 72 characters, no trailing period.
- Body: wrapped at 72 columns, explaining *why* rather than restating the
  diff. Optional for trivial changes, expected for anything a reviewer
  would otherwise have to reconstruct.
- One logical change per commit. Formatting-only churn is split out so it
  does not hide a behavior change.

## Getting to `main`

1. Branch from an up-to-date `main`.
2. Push the branch and open a pull request — `main` takes no direct pushes.
3. Rebase rather than merge when picking up new `main` commits, so the
   branch keeps a linear history and the diff stays readable.
4. Squash on merge if the branch accumulated fixup commits; keep the
   individual commits when each one stands on its own.

## Remote branches, for reference

`origin` currently carries `main`, this branch, and several older
ticket branches (`WW-2001-merge-commit`, `WW-2002-squash`,
`WW-2003-rebase`, `hotfix-urgent`). They predate this document and are
not held to it.
