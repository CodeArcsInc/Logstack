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
   snapshot = ''
   endpoint = ''

   if len(argv) == 0:
      print 'create-snapshot.py -r <aws_region> -e <aws_elasticsearch_endpoint> -s <snapshot_name>'
      sys.exit(2)

   try:
      opts, args = getopt.getopt(argv,'hr:e:s:')
   except getopt.GetoptError:
      print 'create-snapshot.py -r <aws_region> -e <aws_elasticsearch_endpoint> -s <snapshot_name>'
      sys.exit(2)
   for opt, arg in opts:
      if opt == '-h':
         print 'create-snapshot.py -r <aws_region> -e <aws_elasticsearch_endpoint> -s <snapshot_name>'
         sys.exit()
      elif opt == '-r':
         region = arg
      elif opt == '-e':
         endpoint = arg
      elif opt == '-s' :
         snapshot = arg

   print 'Region is ', region
   print 'Endpoint is ', endpoint
   print 'Snapshot is ', snapshot
   
   client = ESConnection(
            region=region,
            host=endpoint,
            is_secure=False)

   print 'Creating Snapshot'
   resp = client.make_request(method='PUT',path='/_snapshot/s3-backup/'+snapshot)
   print resp.read()

if __name__ == "__main__":
   main(sys.argv[1:])