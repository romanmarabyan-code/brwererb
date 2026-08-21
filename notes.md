# Notes

Scratch notes for the BER-2/fix branch.

## Branch layout

- `hghghghg.html` — placeholder page added in `4c9d932`.
- `index.html`, `README.md` — pre-existing, unchanged on this branch.
- `demo/`, `docs/` — inherited from `main`; nothing on this branch touches them.

## Conventions

- Branch naming follows `<TICKET>/<short-slug>`, e.g. `BER-2/fix`.
- Commit subjects stay under 72 characters; detail belongs in the body.
- Nothing is pushed to `main` directly — everything lands through a PR.

## See also

- [`docs/branch-workflow.md`](docs/branch-workflow.md) — the durable version
  of the conventions above, promoted out of this scratch file.
- [`README.md`](README.md) — repository orientation and the contents table.

Time logged on this branch is recorded in commit subjects using the
`#time` syntax, e.g. `BER-2 #time 2h 30m ...`, so the tracker can pick it
up from the PR.
