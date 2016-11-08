#!/usr/bin/python

import sys, getopt, boto.connection

class ESConnection(boto.connection.AWSAuthConnection):

    def __init__(self, region, **kwargs):
        super(ESConnection, self).__init__(**kwargs)
        self._set_auth_region_name(region)
        self._set_auth_service_name("es")

    def _required_auth_capability(self):
        return ['hmac-v4']

def main(argv):
   region = ''
   endpoint = ''
   bucket = ''
   rolearn = ''

   if len(argv) == 0:
      print 'create-snapshot-repository.py -r <aws_region> -e <aws_elasticsearch_endpoint> -b <s3_bucket> -a <iam_role_arn>'
      sys.exit(2)

   try:
      opts, args = getopt.getopt(argv,'hr:e:b:a:')
   except getopt.GetoptError:
      print 'create-snapshot-repository.py -r <aws_region> -e <aws_elasticsearch_endpoint> -b <s3_bucket> -a <iam_role_arn>'
      sys.exit(2)
   for opt, arg in opts:
      if opt == '-h':
         print 'create-snapshot-repository.py -r <aws_region> -e <aws_elasticsearch_endpoint> -b <s3_bucket> -a <iam_role_arn>'
         sys.exit()
      elif opt == '-r':
         region = arg
      elif opt == '-e':
         endpoint = arg
      elif opt == '-b' :
         bucket = arg
      elif opt == '-a' :
        rolearn = arg

   print 'Region is ', region
   print 'Endpoint is ', endpoint
   print 'Bucket is ', bucket
   print 'RoleARN is ', rolearn
   
   client = ESConnection(
            region=region,
            host=endpoint,
            is_secure=False)

   print 'Registering Snapshot Repository'
   resp = client.make_request(method='POST',
          path='/_snapshot/s3-backup',
          data='{ "type" : "s3", "settings" : { "bucket" : "' + bucket + '", "region" : "' + region + '", "role_arn" : "' + rolearn + '" } }')
   print resp.read()

if __name__ == "__main__":
   main(sys.argv[1:])