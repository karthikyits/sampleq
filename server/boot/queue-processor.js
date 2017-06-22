var amqp = require('amqplib/callback_api');
var q = 'sampleq';
var rabbitmqUrl = 'amqp://127.0.0.1:5672';

function amqpServer() {
  amqp.connect(rabbitmqUrl, function(err, conn) {
    if(conn) {
      conn.createChannel(function (err, ch) {
        ch.assertQueue(q, {durable: false});
        console.log(" [*] Waiting for messages in %s.", q);
        ch.consume(q, callConsumer, {noAck: true});
      });
    }
    else {
      setTimeout(function() {
        amqpServer()}, 20000
      );
    }
  });
}

function callConsumer(msg) {

  try {
    var message = msg.content.toString();
    console.log('[y] Message Recieved %s:', message);
    var req_obj = JSON.parse(message);
    console.log(req_obj);

  }catch(err){
    (function() {
      console.log("SEVERE: An error occurred while processing queue message", err);
    }());

  }
}

function sendMessage(data, cb){
  console.log('Connecting to Queue...');
  amqp.connect(rabbitmqUrl, function(err, conn) {
    if (conn) {
      conn.createChannel(function(err, ch) {
        var msg = JSON.stringify(data);
        ch.assertQueue(q, {durable: false});
        ch.sendToQueue(q, new Buffer(msg));
        console.log('[x] Message Send to Queue %s', msg);
        cb();
      });
      setTimeout(function () {
        conn.close();
      }, 500);
    } else {
      /* istanbul ignore next*/
      setTimeout(function () {
        sendMessage(data);
      }, 20000);
    }
  });
}

amqpServer();

exports.sendMessage = sendMessage;
