#! /bin/bash

function get_crontab {
	cat <<-EOF
5 0 * * * /opt/elasticsearch/cron-create-snapshot.sh $ENVIRONMENT >> /var/log/cron.log 2>&1
0 1 * * * /opt/elasticsearch/cron-delete-old-indices.sh $ENVIRONMENT >> /var/log/cron.log 2>&1

	EOF
}

filecontents=$(get_crontab)

echo "$filecontents" > /etc/cron.d/elasticsearch-cron

chmod 0644 /etc/cron.d/elasticsearch-cron

touch /var/log/cron.log

crontab /etc/cron.d/elasticsearch-cron

cron