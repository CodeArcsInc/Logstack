# Logstack
Logstack is an Elastic Beanstalk application that provides the following functionality to help round out your ELK stack when using the AWS Elasticsearch service.

- Logstash
- AWS Elasticsearch Authentication Proxy
- AWS Elasticsearch RSS Feed
- AWS Elasticsearch Backup/Maintenance

## Logstash
Logstash is a critical part of the ELK stack and the major component of Logstack. We currently package Logstash 2.2.2 for which the documentation can be found [here!](https://www.elastic.co/guide/en/logstash/2.2/introduction.html)

### Configuration
In order to get Logstash up and running you must first do some simple configuration so that it can work in your AWS setup, simply follow these steps.

1. Create a logstash configuration file
  * We have provided the example-logstash.conf file to get you started. This example shows how you would take in logs from Filebeat agents, graphite, and our Candelstack service.
  * If you have multiple environments in AWS, for example a DEV and PROD environment we recommend having a configuration file for each environment and prefix the file name with your environment name. This would then allow you to use Elastic Beanstalk environment variables as part of your setup to ensure the correct configuration file is used by Logstash.
2. Modify the start-logstash.sh script
  * You must make the necessary modifications to this script so that the cfg variable has the correct config file name.
  * If you have multiple environments and followed are above recommendation then you can do something like the following to make the config file be driven off an Elastic Beanstalk environment variable called `ENVIRONMENT`
  ```
  #! /bin/bash

  cfg="/opt/logstash/$ENVIRONMENT-logstash.conf"

  /opt/logstash/bin/logstash -f "$cfg"
  ```

## AWS Elasticsearch Authentication Proxy

## AWS Elasticsearch RSS Feed

## AWS Elasticsearch Backup/Maintenance
