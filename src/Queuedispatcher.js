var config = require('../config');
var AWS = require('aws-sdk');
var sqs = {};
var twitter = require('twitter');
var TweetExport = require('../models/Tweet');
var Tweet = TweetExport.Tweet;
var User = TweetExport.User;
var Place = TweetExport.Place;
var liveinterval= null;
var periodicInterval = null;

AWS.config.update({
    accessKeyId: config.K,
    secretAccessKey: config.S,
    region: config.R});

sqs = new AWS.SQS();

var words = process.argv[2];

//console.log(words);
var connectToTwitter;
  (connectToTwitter = function(){
      // Create a new ntwitter instance
      var twit = new twitter(config.twitter);
      console.log('going to connect');

      // Set a stream listener for tweets matching tracking keywords
      twit.stream('statuses/filter',{ track: words}, function(stream){
      	if(liveinterval != null)
      	{
      		clearInterval(liveinterval);
			liveinterval = null;	
      	}
		onDataArrived(stream);
		stream.on('error', function(error) {
		console.log('twitter has stopped sending data'+error);
		if(liveinterval != null)
		{
			clearInterval(liveinterval);
			liveinterval = null;
		}
		liveinterval = setInterval(function() {
			console.log('re triggered');
			start();
		},60*1000);//re trigger job after 1minute
        });
        //console.log('stream closed');
      });

  })();

function onDataArrived(stream){
	stream.on('data', function(data) {
		//console.log(data);
		sendSqsMessage(data);
	});
}

function start(){
	  connectToTwitter();
}

function sendSqsMessage(msg) {
	'use strict';

	var params = {
		MessageBody: JSON.stringify(msg) ,
		QueueUrl: config.url,
		DelaySeconds: 0
	};

	sqs.sendMessage(params, function (err, data) {
		if (err) {
		  console.log(err, err.stack);
		} // an error occurred
		else {
		  //console.log('data sent !');
		}
	});
}

if (process.pid) {
  console.log('Queue dispatcher PID is' + process.pid);
}

start();