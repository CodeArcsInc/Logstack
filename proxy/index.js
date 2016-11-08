/*
*  We are using this proxy because AWS elasticsearch authentication methods were not suitable, basic auth what we need for now. 
*  This proxy calculates AWS signature and add the appropriate headers. 
*  The script  was shared @ https://forums.aws.amazon.com/thread.jspa?threadID=218214, we only added the basic authentication feature. 
*/

var AWS = require('aws-sdk');
var http = require('http');
var httpProxy = require('http-proxy');
var express = require('express');
var bodyParser = require('body-parser');
var stream = require('stream');
var basicAuth = require('basic-auth-connect');

if (process.argv.length != 3) {
    console.error('usage: aws-es-proxy <my-cluster-endpoint>');
    process.exit(1);
}
var ENDPOINT = process.argv[2];
var m = ENDPOINT.match(/\.([^.]+)\.es\.amazonaws\.com\.?$/);
if (!m) {
    console.error('region cannot be parsed from endpoint address, must end in .<region>.es.amazonaws.com');
    process.exit(1);
}
var REGION = m[1];
var TARGET = 'https://' + process.argv[2];
var PORT = 30005;
var BIND_ADDRESS = '0.0.0.0';

var creds;
var chain = new AWS.CredentialProviderChain();
chain.resolve(function (err, resolved) {
    if (err) throw err;
    else creds = resolved;
});

function getcreds(req, res, next) {
    return creds.get(function (err) {
        if (err) return next(err);
        else return next();
    });
}

// Create the proxy for AWS requests
var awsProxy = httpProxy.createProxyServer({
    target: TARGET,
    changeOrigin: true,
    secure: true
});

// Create the proxiy for RSS requests
var rssProxy = new httpProxy.createProxyServer({
  target: 'http://localhost:30090',
  secure: true
});

var app = express();

app.use(bodyParser.raw({type: '*/*'}));

// Authentication
app.use(getcreds);
app.use(basicAuth('$TODO_POXY_USERNAME', '$TODO_PROXY_PASSWORD'));

// If it is a request to the RSS servlet send it to the other proxy and don't authenticate
app.get('/RSS*', function(req, res, next) {
  var bufferStream;
  if (Buffer.isBuffer(req.body)) {
    var bufferStream = new stream.PassThrough();
    bufferStream.end(req.body);
  }
  rssProxy.web(req, res, {buffer: bufferStream});
});

// Send them on to the elasticsearch node
app.use( function (req, res) {
    var bufferStream;
    if (Buffer.isBuffer(req.body)) {
        var bufferStream = new stream.PassThrough();
        bufferStream.end(req.body);
    }
    awsProxy.web(req, res, {buffer: bufferStream});
});

// Modify the proxy connection before data is sent to perform AWS authentication
awsProxy.on('proxyReq', function (proxyReq, req, res, options) {
    var endpoint = new AWS.Endpoint(ENDPOINT);
    var request = new AWS.HttpRequest(endpoint);
    request.method = proxyReq.method;
    request.path = proxyReq.path;
    request.region = REGION;
    if (Buffer.isBuffer(req.body)) request.body = req.body;
    if (!request.headers) request.headers = {};
    request.headers['presigned-expires'] = false;
    request.headers['Host'] = ENDPOINT;
    
    var signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(creds, new Date());

    proxyReq.setHeader('Host', request.headers['Host']);
    proxyReq.setHeader('X-Amz-Date', request.headers['X-Amz-Date']);
    proxyReq.setHeader('Authorization', request.headers['Authorization']);
    if (request.headers['x-amz-security-token']) proxyReq.setHeader('x-amz-security-token', request.headers['x-amz-security-token']);
});

http.createServer(app).listen(PORT, BIND_ADDRESS);
console.log('listening at ' + BIND_ADDRESS + ':' + PORT);
