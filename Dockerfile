# Ubuntu linux, node, npm, and Oracle Java 8

FROM 725821652969.dkr.ecr.eu-west-1.amazonaws.com/ubuntu-logstash
MAINTAINER Tiago Lopo [...]

# Add the necessary files for Logstash
ADD start-logstash.sh /opt/
ADD *-logstash.conf /opt/logstash/

# Install the needed logstash plugins
RUN /opt/logstash/bin/plugin install logstash-output-amazon_es &&\
	/opt/logstash/bin/plugin install logstash-filter-prune &&\
	/opt/logstash/bin/plugin install logstash-filter-grok &&\
	/opt/logstash/bin/plugin install logstash-filter-date

# Add the necessary files for Elasticsearch
ADD elasticsearch /opt/elasticsearch
ADD elasticsearch/crontab /etc/cron.d/elasticsearch-cron

# Install the various pieces of python code we need and schedule cron to execute daily snapshots
RUN sudo apt-get install -y python-pip &&\
	pip install -U boto &&\
	pip install -U elasticsearch-curator==3.5.1 &&\
	chmod 0644 /etc/cron.d/elasticsearch-cron &&\
	touch /var/log/cron.log &&\
	crontab /etc/cron.d/elasticsearch-cron

# Add the necessary files for the proxy
ADD proxy /opt/proxy
ADD start-proxy.sh /opt/

# Install the proxy dependencies from NPM
RUN cd /opt/proxy && /usr/bin/npm install 

# Add the necessary files for RSS
ADD rss /opt/rss
ADD start-rss.sh /opt/

# Add the necessary files for supervisor
ADD supervisord.conf /etc/supervisor/supervisord.conf

# Expose the container port and launch supervisor
EXPOSE 9090
CMD cron && /opt/elasticsearch/run-create-snapshot-repository.sh && supervisord -c /etc/supervisor/supervisord.conf