# syntax=docker/dockerfile:1

# The CMS is the Next app in cms/, but it cannot ship on its own: its preview
# route require()s ../build.js at runtime and serves the site's own stylesheets
# and assets, so the image carries the whole repository with cms/ inside it and
# runs with cms/ as the working directory. Keeping them together also means the
# preview an editor sees is drawn by exactly the build.js that deploys.

FROM node:22-bookworm-slim AS deps
WORKDIR /app/cms
COPY cms/package.json cms/package-lock.json ./
# Installed inside the image rather than copied from a checkout: sharp and the
# Payload native modules resolve to platform-specific binaries, and the ones
# sitting in a Windows working tree are the wrong ones.
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/cms/node_modules ./cms/node_modules
COPY . .
WORKDIR /app/cms
# `npm run build` regenerates globals.generated.ts and blocks.generated.ts from
# ../tools/cms-config.js before next build — which is why the repository root
# has to be present by this point. 8 GB of heap is the cms build script's own
# number; the homepage global is 183 fields wide.
#
# The two values are placeholders kept inside the RUN, so they never reach the
# image's environment: next build compiles payload.config.ts, which constructs
# the database adapter, and that needs a connection string to exist. It never
# opens a connection.
RUN DATABASE_URI=postgres://build:build@127.0.0.1:5432/build \
    PAYLOAD_SECRET=build-only-not-a-secret \
    npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
# Publishing commits the export to the site repository from inside this
# container (cms/src/lib/publish.ts), and the slim image ships without git.
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app /app
WORKDIR /app/cms
# Uploads land here and the deployment bind-mounts a volume over it, so an
# image rebuild never takes an editor's images with it.
RUN mkdir -p /app/cms/media
EXPOSE 3001
# Migrations first. With NODE_ENV=production Payload will not push a schema
# (db-postgres/dist/connect.js gates it on NODE_ENV), so an empty database has
# no tables until `payload migrate` has run. It is a no-op once applied.
CMD ["sh", "-c", "npx payload migrate && npm start"]
