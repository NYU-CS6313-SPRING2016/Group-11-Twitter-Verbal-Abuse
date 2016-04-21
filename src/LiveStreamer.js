//4th stage
//Live streaming of tweets

var Category = require('./CategoryAggregate');
var TweetClassifier = require('./TweetClassifier');
var cb;
var dataBuffer = [];
var isPersisted=0;
var prev=0;
var interval= null;
var classificationCounts=[];
var categories = 4;


function reset(){
	classificationCounts[0]=0;
	classificationCounts[1]=0;
	classificationCounts[2]=0;
	classificationCounts[3]=0;
	dataBuffer=[];
}

function persistTweets(){
	var idx=0;
	for(;idx<dataBuffer.length;idx++)
	{
		tweet = dataBuffer[idx];
		tweet.save();
	}
}

function _get_(upto){ //get upto minutes of data from mongodb
	reset();
	if(prev !=0)
	{
		clearInterval(interval);
		prev = upto;
		reset();
	}
	console.log('reset time !');
	interval = setInterval(function() {
  		var idx =0;
  		var retCategories ={
  			categories:[],
  			timestamp:Date.now
  		};
  		while(idx < categories)
  		{
  			retCategories.categories.push({
  				"name" : _mapperToString(idx),
  				"val": classificationCounts[idx]
  			});
  			idx++;
  		}
  		cb(retCategories);
  		persistTweets();
  		reset();
	}, 5*1000);//every 5 seconds
}

function _register_(fn){
	cb=fn;
}

function _append_(data){//called by 4th stage component
	dataBuffer.push(data);
	var idx = _mapperToId(TweetClassifier.getClassification(data.content));
	if(idx !=-1)
		classificationCounts[idx]++;
}

function _mapperToId(type){
	if(type == 'sexual')
		return 0;
	else if(type == 'general')
		return 1;
	else if(type == 'women')
		return 2;
	else if(type == 'racial')
		return 3;
	else return -1;
}

function _mapperToString(id){
	if(id == 0)
		return 'sexual';
	else if(id == 1)
		return 'general';
	else if(id == 2)
		return 'women';
	else if(id == 3)
		return 'racial';
	else return null;
}

function _stop_() { 
	if(interval != null)
		clearInterval(interval);
	reset();
}

var stream = {
	getData: _get_,
	register: _register_,
	append: _append_,
	stop: _stop_
};

module.exports = stream;