#! /bin/bash

cfg="/opt/logstash/$TODO_LOGSTASH_CONF_NAME"

/opt/logstash/bin/logstash -f "$cfg"