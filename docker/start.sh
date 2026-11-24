#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL must be configured}"
: "${SESSION_SECRET:?SESSION_SECRET must be configured}"
cd /app
/app/migrate
exec /app/api
