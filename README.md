# Logstack
Logstack is an Amazon Elastic Beanstalk application that provides the following functionality to help round out your ELK stack when using the AWS Elasticsearch service.

- Logstash
- AWS Elasticsearch Authentication Proxy
- AWS Elasticsearch RSS Feed
- AWS Elasticsearch Backup/Maintenance Tools

## Logstash
Logstash is a critical part of the ELK stack and the major component of Logstack. We currently package Logstash 2.2.2 for which the documentation can be found [here!](https://www.elastic.co/guide/en/logstash/2.2/introduction.html)

### Configuration
In order to get Logstash up and running you must first do some simple configuration so that it can work in your AWS setup, simply follow these steps.

1. Create a logstash configuration file
  * We have provided the example-logstash.conf file to get you started. This example shows how you would take in logs from Filebeat agents, graphite, and our Candlestack service.
  * If you have multiple environments in AWS, for example a DEV and PROD environment we recommend having a configuration file for each environment and prefix the file name with your environment name. This would then allow you to use Elastic Beanstalk environment variables as part of your setup to ensure the correct configuration file is used by Logstash.
2. Modify the `start-logstash.sh` script
  * You must make the necessary modifications to this script so that the cfg variable has the correct config file name.
  * If you have multiple environments and followed are above recommendation then you can do something like the following to make the config file be driven off an Elastic Beanstalk environment variable called `ENVIRONMENT`.
  ```bash
  #! /bin/bash

  cfg="/opt/logstash/$ENVIRONMENT-logstash.conf"

  /opt/logstash/bin/logstash -f "$cfg"
  ```

## AWS Elasticsearch Authentication Proxy
By default an AWS Elasticsearch domain does not provide authentication, however if you follow the instructions found [here](https://aws.amazon.com/blogs/security/how-to-control-access-to-your-amazon-elasticsearch-service-domain/) such that only a certain IAM user is allowed access then you are faced with the problem of people can no longer directly access Kibana to view the data. This is where the AWS Elasticsearch Authentication Proxy component comes in to play by providing an HTTP proxy server that will authenticate the request and allow you to access Kibana.

### Configuration
In order to get the AWS Elasticsearch Authentication Proxy running you must first do some simple configuration so that it can work in your AWS setup, simply follow these steps.

1. Modify the `start-proxy.sh` script
 * Simply replace `$TODO_ELASTICSEARCH_ENDPOINT` with the Elasticsearch endpoint found in the AWS Elasticsearch dashboard.
 * If you have multiple environments then you can modify the script to look something like this assuming you are using an Elastic Beanstalk environment variable called `ENVIRONMENT`.
 ```bash
 #! /bin/bash

 ELASTICSEARCH="dev-elasticsearch-endpoint-goes-here"

 if [ "$ENVIRONMENT" == 'prod' ] ; then
 	ELASTICSEARCH="prod-elasticsearch-endpoint-goes-here"
 fi

 /usr/bin/nodejs /opt/proxy "$ELASTICSEARCH"
 ```
2. Modify the `/proxy/index.js` file
 * Simply find and replace the variables `$TODO_POXY_USERNAME` and `$TODO_PROXY_PASSWORD` with the username and password you want users to enter when trying to access Kibana
3. This is optional but we also recommend you create a user friendly Route 53 CNAME record that points to an Elasticbeanstalk environment URL so that users need only remember that user friendly URL and you can bring up and down different Elasticbeanstalk environments behind the scenes. To redirect users to a new environment you simply swap Elasticbeanstalk environment URLs.

## AWS Elasticsearch RSS Feed
Alot of times you want to be able to monitor your application logs with out actually having to constantly go and visit Kibana in a browser. To that end RSS is a great option to get a direct feed of the logs you care to monitor such as errors. To support this we have developed an RSS servlet that only requires you to create a Kibana dashboard of the logs you want to monitor via an RSS feed.

### Configuration
In order to get the AWS Elasticsearch RSS Feed running you must first do some simple configuration so that it can work in your AWS setup, simply follow these steps.

1. Modify the `start-rss.sh` script
 * Just like you did for the `start-proxy.sh` script simply replace the `$TODO_ELASTICSEARCH_ENDPOINT` variable as appropriate.
2. Create a Kibana dashboard
3. Add the RSS feed URL to your RSS reader (will have to support basic authentication since it will be calling the AWS Elasticsearch Authentication Proxy)
 * The URL is simply https://$LOGSTACK_URL/rss?dashboard=$DASHBOARD_NAME
 
## AWS Elasticsearch Backup/Maintenance Tools
Last but not least when using the AWS Elasticsearch service you get automated snapshots but these are likely inadequate for your support needs, which is where the AWS Elasticsearch Backup/Maintenance Tools comes in. These tools when properly configured allow you to create manual snapshots that run whenever you want and you can restore the created snapshots to any AWS Elasticsearch domain. The tools will also perform any necessary maintenance on the Elasticsearch indices, such as deleting old indices that are no longer used.

### Configuration
In order to the AWS Elasticsearch Backup/Maintenance Tools running you must first do the following configurations steps.

1. Follow the instructions outlined [here](http://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains.html#es-managedomains-snapshots) to setup the necessary AWS pieces
2. Modify the `/elasticsearch/delete-old-indices.sh` script
 * Replace the `$TODO_LOGSTASH_HOST`, `$TODO_PROXY_USERNAME`, and `$TODO_PROXY_PASSWORD` variables with the relevant pieces of information based off the configuration steps you did above.
 * Change the `--older-than 30` if you want to keep more or less than 30 days of indices.
 * Change the `--timestring "%Y.%m.%d"` if your indices follow a different pattern.
 * Since this is using Curator 3.5.1 you can make futher modifications based off the Curator documentation found [here](https://www.elastic.co/guide/en/elasticsearch/client/curator/3.5/getting-started.html).
3. Modify the '/elasticsearch/run-create-snapshot.sh` script
 *  Replace the `$TODO_AWS_REGION`, `$TODO_SNAPSHOT_NAME`, and `$TODO_ELASTICSEARCH_ENDPOINT` variables with the relevant pieces of information based off your AWS setup and how you want your snapshots to be named.
  * An example of a good snapshot name that can support to the minute snapshots is if you used `date +%Y-%m-%d_%H-%M`
4. Modify the '/elasticsearch/run-create-snapshot-repository.sh` script
 * Replace the `$TODO_AWS_REGION`, `$TODO_S3_BUCKET`, `$TODO_AWS_ROLE_ARN`, and `$TODO_ELASTICSEARCH_ENDPOINT` variables with the relevant pieces of information based off your AWS setup and the actions took you in step 1.
5. Modify the '/elasticsearch/run-list-snapshots.sh` script
 * Replace the `$TODO_AWS_REGION` and `$TODO_ELASTICSEARCH_ENDPOINT` variables with the relevant pieces of information based off your AWS setup.
 
_**NOTE: In the above scripts if you have multiple environments you will have to take similar steps as in the above instructions to account for the multiple environments**_
