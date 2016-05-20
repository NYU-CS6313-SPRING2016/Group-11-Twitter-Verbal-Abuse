//FIRST STAGE

var TweetExport = require('../models/Tweet');
var EmotionalFilter = require('../src/EmotionFilter');
var http = require('http');
var Tweet = TweetExport.Tweet
var User = TweetExport.User;
var Place = TweetExport.Place;
var isPaused=0;
var cb;
var lastTweetReceivedTime;
var config = require('../config');
var AWS = require('aws-sdk');
var sqs = {};
//var heapdump = require('heapdump');

var _onMessage= function(stream){

  stream.on('data', function(data) {
    lastTweetReceivedTime = Date.now();
    
    if(isPaused) return;

    var isGeoTagged=0;
    var isEnglish=0;
    if (data['user'] !== undefined) {
      // Construct a new tweet object
      var tweet = {
        twid: data['id_str'],
        geo: data['geo'],
        content: data['text'],
        coordinates: data['coordinates'],
        place:null,
        user: null,
        createdAt: data['created_at'],
        followers_count: 0
      };

      if(tweet.coordinates !== null)
      {
        isGeoTagged =1;
      }

      var tweetEntry = new Tweet(tweet);

      if(data['place'] !== null)
      {
        var place = {
          tweet_place_id :data['place']['id'],
          tweet_place_name : data['place']['name'],
          tweet_country_code : data['place']['country_code'],
          tweet_country_name : data['place']['country'],
          box : data['place']['bounding_box']
        }
        var placeEntry=new Place(place);
        tweetEntry.place=placeEntry;
      }

      if(data['user'] !== null)
      {
        var user = {
          user_screenname : data['user']['screen_name'],
          user_verified : data['user']['verified'],
          user_lang : data['user']['lang'],
          user_followers_count: data['user']['followers_count'],
          user_favourites_count: data['user']['favourites_count']
        }
        if(user.user_lang == 'en')
        {
          isEnglish =1;
        }
        var userEntry=new User(user);
        tweetEntry.user=userEntry;
      }

      if(isEnglish)
      {
        EmotionalFilter.secondStage(tweetEntry);
      }
    }
  });
};

  var put= function(data){
  //if(isPaused) return;
  lastTweetReceivedTime = Date.now();

  var isGeoTagged=0;
  var isEnglish=0;
  if (data['user'] !== undefined) {
    // Construct a new tweet object
    var tweet = {
        twid: data['id_str'],
        geo: data['geo'],
        content: data['text'],
        coordinates: data['coordinates'],
        place:null,
        user: null,
        createdAt: data['created_at'],
        followers_count: 0
      };

      if(tweet.coordinates !== null)
      {
        isGeoTagged =1;
      }

      var tweetEntry = new Tweet(tweet);

      if(data['place'] !== null)
      {
        var place = {
          tweet_place_id :data['place']['id'],
          tweet_place_name : data['place']['name'],
          tweet_country_code : data['place']['country_code'],
          tweet_country_name : data['place']['country'],
          box : data['place']['bounding_box']
        }
        var placeEntry=new Place(place);
        tweetEntry.place=placeEntry;
      }

      if(data['user'] !== null)
      {
        var user = {
          user_screenname : data['user']['screen_name'],
          user_verified : data['user']['verified'],
          user_lang : data['user']['lang'],
          user_followers_count: data['user']['followers_count'],
          user_favourites_count: data['user']['favourites_count']
        }
        if(user.user_lang == 'en')
        {
          isEnglish =1;
        }
        var userEntry=new User(user);
        tweetEntry.user=userEntry;
      }

      if(isEnglish)
      {
        EmotionalFilter.secondStage(tweetEntry);
      }
    }
  };

  var removeFromQueue = function(message) {
     sqs.deleteMessage({
        QueueUrl: config.url,
        ReceiptHandle: message.ReceiptHandle
     }, function(err, data) {
        // If we errored, tell us that we did
        err && console.log(err);
     });
  };

  function _readerFromAmazon(){
    AWS.config.update({
    accessKeyId: config.K,
    secretAccessKey: config.S,
    region: config.R});

    sqs = new AWS.SQS();
    recursiveFetch();
  }

  function recursiveFetch(){
      sqs.receiveMessage({
       QueueUrl: config.url,
       MaxNumberOfMessages: 10, // how many messages do we wanna retrieve?
       VisibilityTimeout: 60, // seconds - how long we want a lock on this job
       WaitTimeSeconds: 20 // seconds - how long should we wait for a message?
      }, function(err, data) {
       // If there are any messages to get
       if(data != null)
       {
         if (data.Messages) {
            // // Get the first message (should be the only one since we said to only get one above)
            // var message = data.Messages[0];
            // var body = JSON.parse(message.Body);
            // //console.log(body);
            // put(body)
            // // Clean up after yourself... delete this message from the queue, so it's not executed again
            // removeFromQueue(message);  // We'll do this in a second
            data.Messages.forEach(function(message) {
              var body = JSON.parse(message.Body);
              //console.log(body);
              put(body)
              // Clean up after yourself... delete this message from the queue, so it's not executed again
              removeFromQueue(message);  // We'll do this in a second
            });
         }
       }
      });
      setTimeout(recursiveFetch,500);
  }

  //Pause streaming
  function _pause()
  {
    isPaused=1;
  };

  function _isPaused()
  {
    return isPaused;
  }
  //Continue streaming

  function _continueStream()
  {
    isPaused=0;
  };

  function _registerCb(callback)
  {
    cb = callback;
    setInterval(function() {
      if(lastTweetReceivedTime === undefined)return;
      var current = Date.now();
      var timeDiff = current - lastTweetReceivedTime;
      timeDiff /= 1000;
      var seconds = Math.round(timeDiff % 60);
      if(seconds >= 5)//If data is not there for 5 seconds then reset the twitter connenction
      {
        console.log('reset twitter timeout')
        lastTweetReceivedTime=undefined;
        cb();
      }
    },4*1000); //every 1 second poll
  }

  var stream = {
    onMessage: _onMessage,
    pause: _pause,
    continueStream: _continueStream,
    registerCb:_registerCb,
    readerFromAmazon:_readerFromAmazon,
    isPaused :_isPaused
  };
  
module.exports = stream
