FROM alpine:3.11.6

ARG USER=mpd
ARG GROUP=mpd

RUN apk add --no-cache sudo shadow mpd alsa-utils \
    && addgroup "${GROUP}" \
    && adduser "${USER}" "${GROUP}" \
    && adduser "${USER}" audio

COPY ./config/mpd.conf /etc/mpd.conf

COPY ./entrypoint.sh ./entrypoint.sh

ENTRYPOINT [ "sh", "./entrypoint.sh" ]
