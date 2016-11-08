#! /bin/bash

ELASTICSEARCH="$TODO_ELASTICSEARCH_ENDPOINT"

java -jar -Des.host="$ELASTICSEARCH" /opt/jetty/jetty-runner.jar --port 30090 --log /var/log/jetty_request_yyyy_mm_dd.log --out /var/log/jetty_yyyy_mm_dd.log /opt/rss/ElasticRssServlet-0.0.1-SNAPSHOT.war