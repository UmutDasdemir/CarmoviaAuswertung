#!/bin/sh
set -eu

if [ -z "${DASHBOARD_USER:-}" ] || [ -z "${DASHBOARD_PASSWORD:-}" ]; then
  echo "DASHBOARD_USER und DASHBOARD_PASSWORD muessen gesetzt sein." >&2
  exit 1
fi

htpasswd -bcB /var/run/carmovia-dashboard.htpasswd "$DASHBOARD_USER" "$DASHBOARD_PASSWORD" >/dev/null
chown root:nginx /var/run/carmovia-dashboard.htpasswd
chmod 640 /var/run/carmovia-dashboard.htpasswd
exec nginx -g 'daemon off;'
