var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;

var userSchema = new mongoose.Schema({ 
    user_screenname: String,
    user_verified : String,
    user_lang: String,
    user_followers_count: Number,
    user_favourites_count: Number
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
    time: {type : Date, default: Date.now}, //store the current time stamp
    classification : Number,
    anger: Number,
    disgust: Number,
    joy: Number,
    sadness: Number
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

var getTweetsForHour = function(days,callback){
    console.log(days);
    var timestamp = new Date(Date.now() - days * 60 * 60 * 1000);
    var val =0;
    if(days >0)val = days-1;
    var totimestamp = new Date(Date.now()- val* 60 * 60 * 1000);
    console.log('from '+timestamp + ' to '+ totimestamp)
    var hexSeconds = Math.floor(timestamp/1000).toString(16);
    var hexSeconds1 = Math.floor(totimestamp/1000).toString(16);
    var Tweet =mongoose.model('Tweet', schema);
    // Create an ObjectId with that hex timestamp
    var constructedObjectId = ObjectID(hexSeconds + "0000000000000000");
    var toconstructedObjectId = ObjectID(hexSeconds1 + "0000000000000000");
    //console.log(constructedObjectId);
    //Tweet.find({}, function(err, doc) {
        Tweet.find({
            "time": { "$lt":totimestamp,"$gt" : timestamp }
        }, function (err, curr) {
            if(err)
              console.log(err);
            else
            {
              console.log('data came back for '+days)
              callback(curr,days);
            }
        }).limit(200)/*.sort({time:-1})*/;
    //});
}

// var _getTweets = function(days,callback) {
//   var Tweet =mongoose.model('Tweet', schema)
//   var start = new Date();
//   var last = new Date();
//   var lastBefore = new Date();
//   var dateOffset = (24*60*60*1000) * 3; //days
//   var idx=0;
//   last.setDate(last.getDate()- days);
//     console.log('start:' + start);
//     //console.log('last:' + last);
//     var timeDiff = Math.abs(start.getTime() - last.getTime());
//     var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
//     console.log('days = ' + (diffDays));
//     var tweets=[];
//   //Tweet.find({time:[start]}, 'time classification anger',{limit:500}, function (err, docs) { console.log('dint find' + err); }).exec(function(err,docs){
//   //Tweet.find({time: {$lt: start,$gt: start}}, 'time classification',{limit:500}, function (err, docs) { console.log('dint find' + err); }).exec(function(err,docs){
//   //Tweet.find({time: {$lt: start,$gt: last}}, 'time classification anger',{limit:500}, function (err, docs) { console.log('dint find' + err); }).exec(function(err,docs){
//   //Tweet.find({time: {$lt: start,$gt: last}}, 'time content classification anger disgust joy sadness',{limit:500}, function (err, docs) { console.log('dint find' + err); }).exec(function(err,docs){
//     for(;idx<=days;idx++){
//       lastBefore.setDate(lastBefore.getDate()- 1);
//       //lastBefore.setDate(last.getDate()- 1);
//       console.log('last:' + last);
//       console.log('lastBefore:' + lastBefore);
//       Tweet.find({time: {$lt: last, $gt:lastBefore}}, 'time content classification anger disgust joy sadness',{limit:15000}, function (err, docs) { console.log('dint find' + err); }).exec(function(err,docs){

//         console.log('+++++++++++++++++++++++++++');
//         // var result_arr = [];
//         // var currTime = start.getTime();
//         // var timeDiff ;//= Math.abs(start.getTime() - last.getTime());
//         // var diffDays ;//= Math.ceil(timeDiff / (1000 * 3600 * 24)); 
//         // for(var x = 0; x < days; x++){
//         //     result_arr[x] = [];
//         // }

//         // If everything is cool...
//         if(!err) {
//           tweets.push(docs);  // We got tweets
//           console.log('data returned by db '+tweets.length);
//           tweets.forEach(function(tweet){
//             console.log(tweet);
//             //timeDiff = Math.abs(currTime - (new Date(tweet['time'])).getTime());
//             //diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
//             //console.log('-->' + diffDays);
             
//           });
//         }
//         else
//           console.log(err);
//       });
//       last.setDate(last.getDate()- 1);
//     }
//     // Pass them back to the specified callback
//     callback(tweets);
// }
// Return a Tweet model based upon the defined schema


  //Tweet.find({},'twid active author avatar body date screenname',{skip: start, limit: 10}).sort({date: 'desc'}).exec(function(err,docs){

  //   // If everything is cool...
  //   if(!err) {
  //     tweets = docs;  // We got tweets
  //     tweets.forEach(function(tweet){
  //       //tweet.active = true; // Set them to active
  //     });
  //   }

  //   // Pass them back to the specified callback
  //   callback(tweets);

  // });

schema.index({ time: 1}); // schema level
//console.log('index created');

module.exports = {
  Tweet : mongoose.model('Tweet', schema),
  User : mongoose.model('User', userSchema),
  Place : mongoose.model('Place', placeSchema),
  getTweets :getTweetsForHour
}
