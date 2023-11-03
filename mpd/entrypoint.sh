#!/bin/sh

set -e;

PUID="${PUID:-1000}";
PGID="${PGID:-1000}";

# echo "${MPD_CONF}" > /etc/mpd.conf;
# aplay -l

usermod  -o -u "${PUID}" mpd;
groupmod -o -g "${PGID}" mpd;

mkdir -p /mpd/cache /mpd/music /mpd/playlists;

test -f /mpd/cache/state || touch /mpd/cache/state;
test -f /mpd/cache/tag_cache || touch /mpd/cache/tag_cache;
test -f /mpd/cache/sticker.sql || touch /mpd/cache/sticker.sql;

sed -i "s/^state: .*/state: pause/" /mpd/cache/state;

chown -R mpd:mpd /mpd/cache /mpd/music /mpd/playlists

mpd \
  --no-daemon \
  --stdout \
  --verbose \
  /etc/mpd.conf;
