# Developer Setup

## Requirements
- Node.js 18 or newer (tested on Node 22)
- A C/C++ toolchain for native modules (`better-sqlite3`, `bcrypt`). On Windows, install "Desktop development with C++" from Visual Studio Build Tools. On Debian/Ubuntu: `sudo apt install build-essential python3`.
- Git

## Install and test

```bash
git clone https://github.com/simonlpaige/neighborhoodos.git
cd neighborhoodos
npm install
npm test
```

`npm test` runs two suites. You should see `35 passed, 0 failed` and `5 passed, 0 failed`. Both use temporary databases and clean up after themselves.

## Configure a neighborhood

```bash
npm run config:example      # copies node.config.example.json to node.config.json
```

Edit `node.config.json`:
- `slug`: a unique id like `waldo@yourorg.org`
- `name`: human-readable neighborhood name
- `bounds`: a north/south/east/west latitude-longitude box around the neighborhood (get these from any map by right-clicking corners)
- `contactEmail`: the data steward's address

Config resolution order: `NOS_CONFIG_PATH` env var, then `./node.config.json`, then built-in defaults.

## Pull public data

```bash
npm run sync            # all enabled sources, incremental
npm run sync:status     # what's in the local DB, no network
node ingest/sync.js --source kc-data     # just city open data
node ingest/sync.js --source legistar    # just council matters/events
```

Optional: get a free Socrata app token and set `KC_OPEN_DATA_TOKEN` to avoid rate limits.

To run nightly, add a cron entry (Linux/macOS) such as:
```
15 3 * * * cd /opt/neighborhoodos && /usr/bin/npm run sync >> sync.log 2>&1
```
On Windows use Task Scheduler with the same command.

## Run the API

```bash
ADMIN_TOKEN="$(openssl rand -hex 24)" \
NODE_SLUG="waldo@yourorg.org" \
DB_PATH=./node.db \
PORT=4242 \
npm run api
```

Then: `curl http://localhost:4242/health`

Admin routes are closed unless `ADMIN_TOKEN` is set or per-admin tokens are provisioned with `node identity/admin-cli.js`. Never set `ALLOW_OPEN_ADMIN=1` outside your own laptop.

## Environment variables

| Variable | Purpose |
|---|---|
| `DB_PATH` / `NOS_DB_PATH` | Database file for API / sync |
| `NODE_SLUG`, `PORT` | Node identity and API port |
| `ADMIN_TOKEN` | Shared admin bearer token (prefer per-admin tokens) |
| `AUDIT_IP_SALT` | Secret salt for hashing IPs in the audit log. Set this in production. |
| `CORS_ORIGIN` | Allowed browser origin for the API |
| `KC_OPEN_DATA_TOKEN` | Optional Socrata app token |
| `NOS_CONFIG_PATH`, `NOS_BOUNDS`, `NOS_NEIGHBORHOOD` | Config overrides |
| `NOS_ENABLE_SOCIAL` | Must be `1` to run the social connector. Requires steward sign-off. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `DIGEST_TO` | Weekly email digest |
| `RL_*_MAX` | Rate-limit tuning |
| `RETENTION_*` | Data retention windows |
| `FEDERATION_MAX_STALENESS_SECONDS`, `NODE_PRIVKEY_PATH` | Federation |

## Adding a schema change

Never edit an existing migration. Add a new file: `identity/migrations/0003_short_name.sql`. It runs automatically, once, in a transaction, the next time a database is opened.

## Working on the website

The site is plain HTML/CSS/JS with no build step. Open `index.html` in a browser, or run `npx serve .` from the repo root. Read [`DESIGN.md`](../DESIGN.md) first; it defines the palette, type, components, and copy rules. Pushing to `main` deploys via GitHub Pages.

## Backups

Stop the API and sync, copy the `.db` file (and `-wal` if present), restart. Keep at least one copy off the machine. Encrypt backups that contain identity tables.
