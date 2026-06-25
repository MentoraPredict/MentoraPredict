#!/bin/sh
set -e

cp /etc/alertmanager/alertmanager.yml /etc/alertmanager/alertmanager.yml.tmp

sed -i "s|__SMTP_FROM__|${ALERTMANAGER_SMTP_FROM:-alertmanager@mentorapredict.com}|g" /etc/alertmanager/alertmanager.yml.tmp
sed -i "s|__SMTP_HOST__|${ALERTMANAGER_SMTP_HOST:-localhost:25}|g" /etc/alertmanager/alertmanager.yml.tmp
sed -i "s|__SMTP_TLS__|${ALERTMANAGER_SMTP_TLS:-false}|g" /etc/alertmanager/alertmanager.yml.tmp
sed -i "s|__EMAIL_TO__|${ALERTMANAGER_EMAIL_TO:-admin@mentorapredict.com}|g" /etc/alertmanager/alertmanager.yml.tmp

mv /etc/alertmanager/alertmanager.yml.tmp /etc/alertmanager/alertmanager.yml

exec /bin/alertmanager "$@"
