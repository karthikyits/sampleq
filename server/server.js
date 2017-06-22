'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var app = module.exports = loopback();
var qprocesser = require('./boot/queue-processor');
var count = 0;
var max = 0;
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/',function(req,res){
  res.sendFile(__dirname + "/index.html");
});

app.post('/api/producer',function(req,res){
  console.log(req.body);
  max = count + req.body.msgcount;
  sendLoop();
  res.end("Sent!!");


});
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});


function sendLoop(){
  if(count < max){
    count++;
    qprocesser.sendMessage({'greet' : 'HelloWorld -> '+count}, function(){
      sendLoop();
    });
  }
}
