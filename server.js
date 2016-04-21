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

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;

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

function streamData(interval){
  liveStreamer.getData(interval);
}

app.use('/api/live/:interval', function(req, res) {
  console.log('interval '+ req.param('interval'));
  var interval = req.param('interval');
  //res.json({ message: 'This is just a response test message, please use the api to interact with our server' });
  if(isSocketDone)  
  { 
    streamData(interval);
    //io.setInterval(streamData,interval*60*1000); //interval is in minutes, so convert into seconds
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
//mongoose.connect('mongodb://localhost:27017/visproject',options);

// Create a new ntwitter instance
var twit = new twitter(config.twitter);

// Start server
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});

TweetClassifier.initClassifier();

// Initialize socket.io
var io = require('socket.io').listen(server);

var  words = '';
require('fs').readFileSync('inputfile.txt').toString().split('\n').forEach(function (line) { words = words.concat(line); })

// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter',{ track: words}, function(stream){
  streamHandler.onMessage(stream);
  console.log('new stream');
});

var emitData = function(data){
  //Send data through IO
  console.log('EMITT');
  console.log(data);
  io.emit('categories',data);
}
var handleClient = function (socket) {  
    // we've got a client connection
    console.log('socket established');
    streamHandler.continueStream();
    liveStreamer.register(emitData);
    isSocketDone=1;
    socket.on("disconnect", function () {
        console.log('disconnected');
        streamHandler.pause();
        liveStreamer.stop();
    });
};

io.on("connection", handleClient);

module.exports = app;