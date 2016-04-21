var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({ 
    user_screenname: String,
    user_verified : String,
    user_lang: String,
});

var placeSchema = new mongoose.Schema({ 
    tweet_place_id: String,
    tweet_place_name : String,
    tweet_country_code: String,
    tweet_country_name: String,
    box:         [],
});

// Create a new schema for our tweet data
var schema = new mongoose.Schema({
    twid       : String,
    geo        : String,
    content    : String,
    coordinates: [],
    place  : [placeSchema],
    user : [userSchema],
    createdAt   : String ,
    time: {type : Date, default: Date.now} //store the current time stamp
});

schema.methods.printTweet = function printTweet (tweet) {
  console.log(tweet.twid + ' ' + tweet.geo + ' ' +tweet.coordinates + ' ' + tweet.coordinates);
  if(tweet.place != undefined && tweet.place != null)
    console.log(tweet.place.tweet_place_id + ' ');
  if(tweet.user != undefined && tweet.user != null)
    console.log(tweet.user.user_screenname + ' ');
  console.log('\n');
};

/*
// Create a static getTweets method to return tweet data from the db
schema.statics.getTweets = function(page, skip, callback) {

  var tweets = [],
      start = (page * 10) + (skip * 1);

  // Query the db, using skip and limit to achieve page chunks
  Tweet.find({},'twid active author avatar body date screenname',{skip: start, limit: 10}).sort({date: 'desc'}).exec(function(err,docs){

    // If everything is cool...
    if(!err) {
      tweets = docs;  // We got tweets
      tweets.forEach(function(tweet){
        //tweet.active = true; // Set them to active
      });
    }

    // Pass them back to the specified callback
    callback(tweets);

  });

};
*/

// Return a Tweet model based upon the defined schema
module.exports = {
  Tweet : mongoose.model('Tweet', schema),
  User : mongoose.model('User', userSchema),
  Place : mongoose.model('Place', placeSchema)
}