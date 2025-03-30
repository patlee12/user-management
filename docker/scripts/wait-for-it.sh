#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available

set -e

TIMEOUT=15
QUIET=0
HOST=""
PORT=""

while [[ $# -gt 0 ]]
do
case "$1" in
    -q|--quiet)
    QUIET=1
    shift
    ;;
    -t)
    TIMEOUT="$2"
    shift 2
    ;;
    --timeout=*)
    TIMEOUT="${1#*=}"
    shift
    ;;
    *)
    if [[ "$HOST" == "" ]]; then
        HOST="$1"
    elif [[ "$PORT" == "" ]]; then
        PORT="$1"
    else
        break
    fi
    shift
    ;;
esac
done

if [[ "$HOST" == "" || "$PORT" == "" ]]; then
    echo "Usage: $0 host port [-t timeout] [-- quiet]"
    exit 1
fi

if [[ "$QUIET" != "1" ]]; then
  echo "Waiting for $HOST:$PORT..."
fi

for i in $(seq "$TIMEOUT"); do
  if nc -z "$HOST" "$PORT"; then
    if [[ "$QUIET" != "1" ]]; then
      echo "$HOST:$PORT is available 🎉"
    fi
    exit 0
  fi
  sleep 1
done

echo "Timeout occurred after waiting $TIMEOUT seconds for $HOST:$PORT"
exit 1
