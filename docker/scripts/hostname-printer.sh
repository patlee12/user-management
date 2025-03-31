#!/bin/sh

apk add --no-cache iputils
sleep 15

echo "Extracting published hostname from /avahi/avahi.log:"
host=$(grep -i "Host name is" /avahi/avahi.log | tail -n 1 | sed -E 's/.*Host name is ([^ ]+).*/\1/' | sed 's/\.$//')

if [ -z "$host" ]; then
  if [ -n "$AVAHI_HOSTNAME" ]; then
    echo "No hostname found in logs, using env-provided value: ${AVAHI_HOSTNAME}.local"
    host="${AVAHI_HOSTNAME}.local"
  else
    echo "No hostname found in logs and no environment variable set. Exiting."
    exit 1
  fi
fi

echo "RESOLVED_HOST=https://${host}" > /avahi/resolved-hostname.env

exit 0
