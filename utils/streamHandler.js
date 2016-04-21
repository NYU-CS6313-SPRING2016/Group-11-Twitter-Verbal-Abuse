//FIRST STAGE

var TweetExport = require('../models/Tweet');
var EmotionalFilter = require('../src/EmotionFilter');
var http = require('http');
var Tweet = TweetExport.Tweet;
var User = TweetExport.User;
var Place = TweetExport.Place;
var isPaused=0;

var _onMessage= function(stream){

  stream.on('data', function(data) {
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
      };
      if(tweet.coordinates !== null)
      {
        isGeoTagged =1;
      }

      var tweetEntry = new Tweet(tweet);

      if(data['place'] != null)
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

      if(data['user'] != null)
      {
        var user = {
          user_screenname : data['user']['screen_name'],
          user_verified : data['user']['verified'],
          user_lang : data['user']['lang']
        }
        if(user.user_lang == 'en')
        {
          isEnglish =1;
        }
        var userEntry=new User(user);
        tweetEntry.user=userEntry;
      }

      if(/*isGeoTagged &&*/ isEnglish)
      {
        //console.log(tweetEntry);
        EmotionalFilter.secondStage(tweetEntry);
      }

      // Save 'er to the database
      /*
      tweetEntry.save(function(err) {
        if (err) {
          console.log('error while saving !');
        }
      });
      */
    }
  });
  
};

function _pause()
  {
    isPaused=1;
  };

  function _continueStream()
  {
    isPaused=0;
  };

  var stream = {
    onMessage: _onMessage,
    pause: _pause,
    continueStream: _continueStream
  };
  
module.exports = stream
