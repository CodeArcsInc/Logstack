#! /bin/bash

ENV=$1
ENDPOINT="$TODO_LOGSTASH_HOST"
USERNAME="$TODO_POXY_USERNAME"
PASSWORD="$TODO_PROXY_PASSWORD"

/usr/local/bin/curator --host "$ENDPOINT" --http_auth "$USERNAME":"$PASSWORD" --use_ssl --port 443 delete indices --older-than 30 --time-unit days --timestring '%Y.%m.%d'