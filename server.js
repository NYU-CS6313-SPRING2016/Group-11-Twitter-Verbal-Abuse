// Require our dependencies
var express = require('express'),
  exphbs = require('express-handlebars'),
  http = require('http'),
  mongoose = require('mongoose'),
  twitter = require('twitter'),
  routes = require('./routes'),
  config = require('./config'),
  streamHandler = require('./utils/streamHandler'),
  liveStreamer = require('./src/LiveStreamer'),
  path    = require("path"),
  TweetClassifier = require('./src/TweetClassifier');
  var tweetModel = require('./models/Tweet');

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;
var streamHandle;
var isSocketDone =0;

// create our router
var router = express.Router();

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname,'public')));

// Disable etag headers on responses
app.disable('etag');

var options = {
  user: 'test',
  pass: 'test'
}

var counter=0;

function streamData(interval){
  liveStreamer.getData(interval);
}

app.use('/api/live/:interval', function(req, res) {
  console.log('interval '+ req.param('interval'));
  var interval = req.param('interval');
  //res.json({ message: 'This is just a response test message, please use the api to interact with our server' });
  if(isSocketDone)  
  { 
    //streamData(interval); //blocked it since not required
    res.status(200).send('Ok');
  }
  else
  {
    console.log('socket.io : no clients');
  }
  //Push back as JSON
});

console.log(__dirname);
// test route to make sure everything is working (accessed at GET http://localhost:8080/)
router.get('/', function(req, res) {
  //res.json({ message: 'This is just a response test message, please use the api to interact with our server' }); 
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

var fetchData = function(period){
  var idx = 0;
    var returnArray = [];
    for(;idx <period; idx++)
    {
      console.log('period '+idx);
      tweetModel.getTweets(idx,function(data,idx){
        //TODO : classify based on dates
        io.emit('junk',1); //basically heroku has 55 seconds timeout
        var result=data;
        var idx1=0;
        var categoryData = [];
        var i=0;
        for(;i<4;i++)
        {
          var block = {
            name:liveStreamer.classtoString(i),
            val:0,
            tweets:[]      
          }
          categoryData.push(block);
        }
        var idx1=0;
        var tweetContent =[];
        for(;idx1< result.length; idx1++){
          tweetContent.push(result[idx1]["content"]);
          var inner= parseInt(result[idx1]["classification"]);
          if(inner != -1)
          {
            categoryData[inner]["val"]++;
            if(categoryData[inner]["tweets"].length <10)
            categoryData[inner]["tweets"].push(result[idx1]["content"]);
          }
        }
        var topTags=[];
        liveStreamer.getTopKWords(tweetContent,topTags);
        var obj = {
          "data":categoryData,
          "toptags":topTags
        }
        returnArray.push(obj);
        if(idx == period-1)
        {
          // res.setHeader('Content-Type', 'application/json');
          // res.send(JSON.stringify({'data':returnArray}));
          io.emit("load24",{'data':returnArray});
        }
      });
    }
}

// /stored/period=7  fetches from today to 7 days back of data
router.get('/stored/:period', function(req, res) {
    var period = req.param('period');
    console.log('GET PERIOD for '+period +' hours');
    res.status(200).send('Ok app is processing');
    setTimeout(function() {
      fetchData(period);
    }, 430)
    console.log('set timeout done')
});


// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Sorry we could not find what you were looking for');
});

// Basic error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Ahh, Something broke!');
});
// Connect to our mongo database
mongoose.connect('mongodb://ds023530.mlab.com:23530/heroku_tsj8qdn8',options);

//test db
var db = mongoose.connection;
db.once('open', function() {
  console.log('connection to db is done');
  //TEST
  // tweetModel.getTweets(20, function(data){
  //   //console.log(data);
  // });
});

//mongoose.connect('mongodb://localhost:27017/visproject');

// Start server
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});

TweetClassifier.initClassifier();

var  words = '';
require('fs').readFileSync('inputfile.txt').toString().split('\n').forEach(function (line) { words = words.concat(line);})

var  stopwords = '';
require('fs').readFileSync('minimal-stop.txt').toString().split('\n').forEach(function (line) { stopwords = stopwords.concat(line);})

if(config.source == "self")
{
  var connectToTwitter;
  (connectToTwitter = function(){
      if(streamHandle !== undefined)
      {
        streamHandle.destroy();
        console.log('destroyed old connection');
      }
      // Create a new ntwitter instance
      var twit = new twitter(config.twitter);
      console.log('going to connect');

      // Set a stream listener for tweets matching tracking keywords
      twit.stream('statuses/filter',{ track: words}, function(stream){
        streamHandle = stream;
        streamHandler.onMessage(stream);

        stream.on('error', function(error) {
          console.log('twitter has stopped sending data')
        });
        console.log('stream closed');
      });
  })();
  /*register to livestreaming to disconnect to twitter if there is no data*/
  streamHandler.registerCb(connectToTwitter);
}
else //it means we need to use Amazon sqs to store data
{
  streamHandler.readerFromAmazon();
  var child_process = require('child_process');
  var workerProcess = child_process.spawn('node', ['src/Queuedispatcher.js', words]);

  workerProcess.stdout.on('data', function (data) {
    console.log('twitter sender stdout: ' + data);
  });

  workerProcess.stderr.on('data', function (data) {
    console.log('twitter sender stderr: ' + data);
  });

  workerProcess.on('close', function (code) {
    console.log('twitter sender process exited with code ' + code);
    process.exit(1);//this means error
  });
}

var emitTweet = function(data){
  io.emit('live',data);
}

var emitData = function(data){
  //Send data through IO
  io.emit('categories',data);
}

var emitLiveTrend = function(data, type){
  if(type == 1) //it means stream top words
  {
    var words={'topkwords':data};
    io.emit('topkwords',words);
  }
  else if(type ==2) //it means stream top users
  {
    var users={'topkusers':data};
    io.emit('topkusers',users);
  }
}

var emitCount = function(data){
  io.emit('conncounter ',data);
}
var handleClient = function (socket) {  
    // we've got a client connection
    console.log('socket established');
    counter++;
    emitCount();
    streamHandler.continueStream();
    liveStreamer.register(emitData);
    liveStreamer.register_live(emitTweet);
    liveStreamer.register_top(emitLiveTrend,stopwords);
    isSocketDone=1;
    socket.on("disconnect", function () {
        console.log('disconnected');
        //streamHandler.pause();
        //liveStreamer.stop();
    });
};

liveStreamer.startAsyncEvents();

// Initialize socket.io
var io = require('socket.io').listen(server);
io.on("connection", handleClient);

module.exports = app;
