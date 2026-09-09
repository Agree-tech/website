# Deploying the CMS to the dev server

The editor runs on the Hetzner box that already runs the `agree-tech` dev stack.
The public site does not: Netlify keeps building `--from-blocks` from the
`content/` committed to git, so this server being down, asleep or mid-upgrade
cannot take agree-tech.io with it. What moves here is the place editors type.

| | |
|---|---|
| Host | the dev box, `agreetech-dev.latxa-shark.ts.net` over tailscale (root) |
| URL | `https://cms.agree-tech.io` |
| Stack | `bpm-micro/docker-compose-agree-tech-dev` — services `website-cms`, `website-cmsdb` in `dev.yml`, two server blocks in `nginx/nginx_hetzner_one_domain.conf` |
| Image | `docker.agree-tech.io/agree-tech-website-cms:latest`, built from the `Dockerfile` at this repository's root |
| TLS | none needed — the box holds a certbot wildcard for `agree-tech.io` and `*.agree-tech.io` |

## Why the image carries the whole repository

`cms/` cannot ship alone. The preview route `require()`s `../build.js` at
runtime and rewrites asset URLs to files in the repository root, which is the
whole reason a preview looks like the deployed page rather than like a second,
drifting renderer. So the image is the repository with `cms/` inside it and
`/app/cms` as the working directory.

## Schema: migrations, not push

In development Payload creates tables by diffing the schema on boot. It refuses
to in production — `db-postgres`'s connect gates that push on
`NODE_ENV !== 'production'`, and `next start` sets `NODE_ENV=production`. So a
deployed container needs migrations, and the image runs `payload migrate` before
`next start`. The globals are generated from `../tools/cms-config.js`, so
**adding a `{{i18n:}}` placeholder to a template changes the schema** and needs a
new migration — see [When the content model changes](#when-the-content-model-changes).

## One-time setup

The first migration is already in `src/migrations` — it creates 215 tables and
applies to an empty database in under a second. What is left is the server side.

**1. DNS** — nothing to do. `*.agree-tech.io` is a wildcard record, so
`cms.agree-tech.io` already resolves to the box.

**2. On the box**, create the data directories and the secret — **before**
pulling the stack repository. Compose validates `env_file` on every command, so
once the new `dev.yml` is checked out, a missing secret file breaks
`docker compose -f volumes.yml -f dev.yml <anything>` for every service, not just this one.
The secret is deliberately not in the stack repository: its `.env` is tracked
in Bitbucket.

```
ssh root@agreetech-dev.latxa-shark.ts.net
mkdir -p /data/volumes/website-cms/media /data/volumes/website-cmsdb
printf 'PAYLOAD_SECRET=%s\n' "$(openssl rand -hex 32)" > /data/volumes/website-cms/env
chmod 600 /data/volumes/website-cms/env
```

**3. Push the stack changes** (`dev.yml` + the nginx conf) to
`bpm-micro/docker-compose-agree-tech-dev`. `website-cms` uses
`depends_on: condition: service_healthy`, which needs Compose v2
(`docker compose version`); if the box only has the v1 `docker-compose`,
flatten it to a plain `depends_on: [website-cmsdb]` — the container's restart
policy then does the waiting.

## Deploying

Build locally or in CI — never on the box. `next build` asks for 8 GB of heap
here, because the homepage global is 183 fields wide.

```
# from the repository root
docker build -t docker.agree-tech.io/agree-tech-website-cms:latest .
docker login docker.agree-tech.io
docker push docker.agree-tech.io/agree-tech-website-cms:latest
```

Then on the box. The stack there is one Compose project (`docker-compose`, from
the directory name `/root/docker-compose`) started from many files: a
gitignored `volumes.yml` that declares the shared named volumes, then `dev.yml`,
then a `postgrest.yml` + `activiti.yml` per tenant. `-f dev.yml` on its own
never validates — its services mount `heapdumps`, which only `volumes.yml`
declares — so every command carries both. With fewer files than the running
project Compose will mention "orphan containers": that is the tenant services
it cannot see, and it is only a warning. **Always name the services**, never
`down`, never `--remove-orphans`.

```
cd /root/docker-compose
git status                                 # the box has been edited in place before
git pull
docker compose -f volumes.yml -f dev.yml pull website-cms
docker compose -f volumes.yml -f dev.yml up -d website-cmsdb website-cms
```

`payload migrate` runs at container start and is a no-op once applied. Watch it
land with `docker compose -f volumes.yml -f dev.yml logs -f website-cms`.

**When the nginx conf changed**, `up -d nginx` does nothing: the compose
definition is unchanged, and the conf is rendered from the template when the
container *starts*, so a reload would re-read the old file too. It has to be a
restart — and that nginx is the edge for the whole dev stack, so test the new
template first:

```
docker compose -f volumes.yml -f dev.yml exec nginx sh -c \
  'envsubst "\$NGINX_DOMAIN" < /etc/nginx/nginx.conf.template > /tmp/new.conf && nginx -t -c /tmp/new.conf'
docker compose -f volumes.yml -f dev.yml restart nginx    # a few seconds of downtime for everything behind it
```

## First boot

The database is empty. Load the site's content and make an admin user — the seed
reads `../content`, which the image carries:

```
docker compose -f volumes.yml -f dev.yml exec -e SEED_EMAIL=<you> -e SEED_PASSWORD=<strong> website-cms npm run seed
```

Pass the credentials rather than taking the seed's defaults: `/admin` is on the
public internet from the moment the container answers, and a default password
is a default password. Run it once: it is a load, not a merge, and the CMS is
the record from then on.

Content is backed up by the export to git. Uploaded images are not — they live
only in `/data/volumes/website-cms/media`, so include that path in whatever
backs up `/data/volumes` on the box.

## Verifying

- `https://cms.agree-tech.io/admin` logs in
- a page's **Preview** renders, and its nav links move between previews
- an uploaded image survives `docker compose -f volumes.yml -f dev.yml restart website-cms`
  (it is on the volume, not in the image)
- from a checkout: `PAYLOAD_URL=https://cms.agree-tech.io npm run verify:export`
  reports no drift

## Publishing what an editor wrote

**Publish site**, the button under the nav links in the admin. It does what an
engineer would do by hand — clone the branch Netlify builds, run
`tools/export-from-payload.js` against the CMS, commit, push — and Netlify
builds from the commit. `src/lib/publish.ts` is the whole of it. Netlify still
builds from `content/` in git, so what deployed stays reviewable as a diff and
revertable with `git revert`; the commit is authored by the editor who pressed
the button, so `git blame` still names a person.

It also commits new uploads into `assets/`. Before it, an uploaded image
existed only in the database: the deploy builds without the CMS, so the page
referenced a file that was never in git and 404ed on it.

What it needs on the box, once: a GitHub fine-grained token with **Contents:
read and write on `Agree-tech/website` only**, in the secrets file beside the
other one —

```
echo 'GITHUB_TOKEN=github_pat_…' >> /data/volumes/website-cms/env
docker compose -f volumes.yml -f dev.yml up -d website-cms      # re-reads env_file
```

The token stays in the environment: the clone's remote carries only a username
and git asks a credential helper for the password, so neither the temporary
clone nor an error message quoting the URL contains it.

Defaults are `Agree-tech/website` and branch `payload`; `PUBLISH_REPO` and
`PUBLISH_BRANCH` in `dev.yml` override them — the branch is the one to change
at cutover to `main`. One publish runs at a time; a second press while one is
running is refused with a message, not queued.

The by-hand route still works and is the fallback if the token is ever wrong:

```
PAYLOAD_URL=https://cms.agree-tech.io npm run export
git commit content/ assets/ && git push
```

## When the content model changes

A new placeholder in a template, a new block, a new field: the generated globals
change, so the schema does too.

```
npm run generate
npm run payload migrate:create
git add src/migrations && git commit
```

Then rebuild and push the image. Skipping this does not fail the build — it
fails at runtime, on the column that is not there.
