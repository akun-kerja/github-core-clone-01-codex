# make.fun GitHub Core Clone

[![make.fun · github-core-clone-01](https://make.fun/badge/github-core-clone-01.svg)](https://make.fun/bounty/github-core-clone-01?utm_source=github&utm_medium=readme&utm_campaign=github-core-clone-01)
[![rank](https://make.fun/badge/github-core-clone-01/akun-kerja/github-core-clone-01-codex/rank.svg)](https://make.fun/bounty/github-core-clone-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=github-core-clone-01)
[![reward](https://make.fun/badge/github-core-clone-01/akun-kerja/github-core-clone-01-codex/reward.svg)](https://make.fun/bounty/github-core-clone-01?utm_source=github&utm_medium=readme&utm_campaign=github-core-clone-01)

Bounty page: https://make.fun/bounty/github-core-clone-01

A standalone, in-memory GitHub-compatible forge for the `github-core-clone-01` make.fun bounty. It runs on Node 22 with built-in modules and has no install-time or runtime dependencies.

## Run

```sh
MAKEFUN_ENV_URL=http://127.0.0.1:8080 MAKEFUN_SHOP_TOKEN=owner:token node --experimental-strip-types main.ts
```

The entry binds an ephemeral HTTP port, registers it with `MAKEFUN_ENV_URL`, and stays alive until the environment reports that grading is finished. `main.ts` contains that lifecycle; the forge implementation is in `app.ts`.

## Implemented surfaces

- REST v3 repository operations, branches, commits, contents, labels, issues, comments, pull requests, and squash merges under `/api/v3`.
- MCP JSON-RPC initialize/discovery, stable tool listing, and shared-store tools under `/mcp`.
- GraphQL endpoint at `/api/graphql` (schema and query coverage is being extended).
- JSON errors, bearer-token checks, and request IDs for API calls.

Data is held in memory for the lifetime of the process. The git smart HTTP pack protocol and complete GraphQL query execution are not yet implemented.
