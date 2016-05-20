//4th stage
//Live streaming of tweets

var Category = require('./CategoryAggregate');
var TweetClassifier = require('./TweetClassifier');
var natural = require('natural');
var tokenizer = new natural.RegexpTokenizer({pattern: /\,/});
var HashTable = require('hashtable');
var hTableWords = new HashTable();
var hTableUsers = new HashTable();
var sortBy = require('sort-by');
var streamingHandler= require('../utils/streamHandler');

//var USCategorizer = require('./CountryCategorizer');
var cb;
var cb_live;
var cb_top;
var dataBuffer = [];
var isPersisted=0;
var prev=0;
var interval= null;
var liveinterval= null;
var classificationCounts=[];
var categories = 4;
var k = 10; //top 10 data
var wordsfromTextFile;
var tokens=[];
var topKWords=[];
var topKUsers=[];
var flushTime = new Date().getTime();
//var usCategorizer = new USCategorizer('US',categories);

function hNode(n,content) {
    this.word = content;
    this.followers_count = n.user[0].user_followers_count + n.user[0].user_favourites_count; // can be favourited without following
    this.parentTweet = n;
    this.previousRank = 0;
}

function uNode(name) {
    this.name = name;
    this.currentRankShift=-1;
    this.cnt=0;
    this.currRank=0;
}

function classificationReset(){
	classificationCounts[0]=0;
	classificationCounts[1]=0;
	classificationCounts[2]=0;
	classificationCounts[3]=0;
}

function dataBufferReset(){
	dataBuffer=[];
}

function persistTweets(){
	var idx=0;
	//console.log('persist')
	for(;idx<dataBuffer.length;idx++)
	{
		tweet = dataBuffer[idx];
		tweet.save();
	}
}

function reset(){
	dataBufferReset();
	classificationReset();
}

function _get_(upto){ //get upto minutes of data from mongodb
	dataBufferReset();
	classificationReset();
	if(prev !=0)
	{
		clearInterval(interval);
		prev = upto;
		reset();
	}
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
  		//if(dataBuffer.length>1)
  			//cb_live(dataBuffer[0]);//Sending live tweet to frontend every 5 seconds
  		persistTweets();
  		//addIntoHashTable();
  		//generateTopK();
  		//console.log(retCategories)
  		classificationReset();
	}, 5*1000);//every 5 seconds
}


function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
}

function addIntoTweetHashTable(arrayOfTweet, hTableTweets){
	var index=0;
	var wordtokenizer = new natural.RegexpTokenizer({pattern: /\ /});

	for (; index< arrayOfTweet.length; index++){ //through each tweet object

		var wordBuffer = wordtokenizer.tokenize(arrayOfTweet[index]);

		//stem from each word in  words
		var idx = 0;
		
		for(; idx<wordBuffer.length; idx++ ){
			//console.log(wordBuffer[idx]+" : ");
			wordBuffer[idx] = natural.PorterStemmer.stem(wordBuffer[idx]);
		}


		//Remove common words
		var idx1= 0;
		for(; idx1<tokens.length; idx1++ ){
			idx=0;
			for(; idx<wordBuffer.length; idx++ ){
				if(wordBuffer[idx] == null) continue;
				if(natural.LevenshteinDistance(wordBuffer[idx],tokens[idx1]) == 1.0) //O(n+d) better than O(n^2) ;)
				{
					wordBuffer[idx] = null;
					break;
				}
			}
		}

		//Lets remove words with URL
		idx = 0;
		for(; idx<wordBuffer.length; idx++ ){
			if(wordBuffer[idx] == null) continue;
			if (wordBuffer[idx].substring(0, 4) == "http")
			{
				wordBuffer[idx] = null;
				continue;
			}
			if (wordBuffer[idx].substring(0, 1) != "#" && wordBuffer[idx].substring(0, 1) != "@")
			{
				wordBuffer[idx] = null;
				continue;
			}
			if(wordBuffer[idx].length>1 && isNumeric(wordBuffer[idx].substring(1,wordBuffer[idx].length)))
			{
				//console.log('number eliminated '+ wordBuffer[idx])
				continue;
			}
		}

		//Store users into hash table
		idx=0;
		for(; idx<wordBuffer.length; idx++ ){
			if(wordBuffer[idx] == null) continue;
			if (wordBuffer[idx].substring(0, 1) != "@")
			{
				if(hTableTweets.get(wordBuffer[idx]) === undefined)
				{
					var newEntry = new uNode(wordBuffer[idx]);
					hTableTweets.put(wordBuffer[idx],newEntry);
				}
				else
				{
					var obj = hTableTweets.get(wordBuffer[idx]);
					obj.cnt++;
				}
			}
		}
	}
}

function _getTopKWords(input,output){
	var idx=0;
	var hTableLocal = new HashTable();
	
	addIntoTweetHashTable(input,hTableLocal);

	idx=0;
	var keys = hTableLocal.keys();
	for(;idx<keys.length;idx++){ 
		output.push(keys[idx]);
	}
	output.sort(sortBy('-cnt'));
	if(output.length > k)
		output= output.splice(0,k);
	hTableLocal=null;
}

/*generates top k users and top k words(hashtags) 
run in O(nlogn)*/
function generateTopK(){
	topKWords = [];//clear the old data
	topKUsers =[];//clear the old data
	var arr=[];
	var keys = hTableWords.keys();
	var idx=0;
	for(;idx<keys.length;idx++){
		topKWords.push(hTableWords.get(keys[idx]));
	}

	topKWords.sort(sortBy('-followers_count'));

	idx=0;
	keys = hTableUsers.keys();
	for(;idx<keys.length;idx++){ 
		topKUsers.push(hTableUsers.get(keys[idx]));
	}
	topKUsers.sort(sortBy('-cnt'));
	//topKUsers.sort(function(usr1, usr2){return usr2-usr1});

	// console.log('*********TOP WORDS*******')
	// idx=0;
	// for(; idx<topKWords.length; idx++)
	// 	console.log(topKWords[idx].word);

	//  console.log('*********TOP USERS*******')
	//  idx=0;
	//  for(; idx<topKUsers.length; idx++)
	//  	console.log(topKUsers[idx]+ " -> "+topKUsers[idx].currRank+ " "+topKUsers[idx].currentRankShift);
	//  console.log('*********TOP USERS END*******')

	//need only top 'k' words
	var newtopKUsers =[];
	var newtopKWords =[];
	if(topKWords.length > k)
		newtopKWords= topKWords.splice(0,k);
	if(topKUsers.length > k)
		newtopKUsers=topKUsers.splice(0,k);

	/*Lets calculate rank shift*/
	idx=0;
	for(;idx<newtopKUsers.length;idx++){
		var obj = newtopKUsers[idx];
		if(obj.currentRankShift == -1) {
			obj.currentRankShift=0;
			obj.currRank=idx;
		}
		else{
			var prevRank = obj.currRank;
			var newRank = idx;
			obj.currRank = idx;
			obj.currentRankShift = prevRank - newRank;
		}
	}

	cb_top(newtopKWords,1);
	cb_top(newtopKUsers,2);
	
	if(hTableUsers.size() >= 5000)
	{
		hTableUsers.clear();
		console.log('users hashtable cleared');
	}
	
	if(hTableWords.size() >= 5000)
	{
		hTableWords.clear();
		console.log('words hashtable cleared');	
	}
	// {
	// 	console.log('Reset hashtable since it will be very big');
	// 	hTableUsers.clear()
	// 	hTableWords.clear()
	// 	flushTime = new Date().getTime();
	// }
	newtopKUsers=[];
	newtopKWords=[];
}

/* Function will add the tweets into two hash tables
this function will run in O(nlogn)*/

function addIntoHashTable(){
	//tokenize all bad words that we have

	var index=0;
	var wordtokenizer = new natural.RegexpTokenizer({pattern: /\ /});

	for (; index< dataBuffer.length; index++){ //through each tweet object

		var wordBuffer = wordtokenizer.tokenize(dataBuffer[index].content);

		//stem from each word in  words
		var idx = 0;
		
		for(; idx<wordBuffer.length; idx++ ){
			//console.log(wordBuffer[idx]+" : ");
			wordBuffer[idx] = natural.PorterStemmer.stem(wordBuffer[idx]);
		}


		//Remove common words
		var idx1= 0;
		for(; idx1<tokens.length; idx1++ ){
			idx=0;
			for(; idx<wordBuffer.length; idx++ ){
				if(wordBuffer[idx] == null) continue;
				if(natural.LevenshteinDistance(wordBuffer[idx],tokens[idx1]) == 1.0) //O(n+d) better than O(n^2) ;)
				{
					wordBuffer[idx] = null;
					break;
				}
			}
		}

		//Lets remove words with URL
		idx = 0;
		for(; idx<wordBuffer.length; idx++ ){
			if(wordBuffer[idx] == null) continue;
			if (wordBuffer[idx].substring(0, 4) == "http")
			{
				wordBuffer[idx] = null;
				continue;
			}
			if (wordBuffer[idx].substring(0, 1) != "#" && wordBuffer[idx].substring(0, 1) != "@")
			{
				wordBuffer[idx] = null;
				continue;
			}
			if(wordBuffer[idx].length>1 && isNumeric(wordBuffer[idx].substring(1,wordBuffer[idx].length)))
			{
				//console.log('number eliminated '+ wordBuffer[idx])
				continue;
			}
		}

		//Store users into hash table
		idx=0;
		for(; idx<wordBuffer.length; idx++ ){
			if(wordBuffer[idx] == null) continue;
			if (wordBuffer[idx].substring(0, 1) == "@")
			{
				if(hTableUsers.get(wordBuffer[idx]) === undefined)
				{
					var newEntry = new uNode(wordBuffer[idx]);
					hTableUsers.put(wordBuffer[idx],newEntry);
				}
				else
				{
					var obj = hTableUsers.get(wordBuffer[idx]);
					obj.cnt++;
					//hTableUsers.remove(wordBuffer[idx]);
					//hTableUsers.put(wordBuffer[idx],newEntry);
				}
				wordBuffer[idx] = null;
			}
			else { //add users
				if(hTableWords.get(wordBuffer[idx]) === undefined)
				{
					var newEntry = new hNode(dataBuffer[index],wordBuffer[idx]);
					hTableWords.put(wordBuffer[idx], newEntry);		
				}
				else
				{					
					var cnt = hTableWords.get(wordBuffer[idx]).followers_count;
					hTableWords.remove(wordBuffer[idx]);
					dataBuffer[index].followers_count+=cnt;
					var newEntry = new hNode(dataBuffer[index],wordBuffer[idx]);
					hTableWords.put(wordBuffer[idx],newEntry);
				}
			}
		}
	}
}

function _register_(fn){
	cb=fn;
}

function _registerlive_(fn){
	cb_live=fn;
}

function _register_top(fn,words){
	if(cb_top === undefined)
	{
		wordsfromTextFile =words;
		tokens = tokenizer.tokenize(wordsfromTextFile);
		cb_top=fn;
	}
}

function _append_(data){//called by 4th stage component
	var idx = _mapperToId(TweetClassifier.getClassification(data.content));
	data.classification = idx;
	if(cb_live !==undefined)
	{
		dataBuffer.push(data);
	}
	else//just save other wise it will save in the timer callback
	{
		//console.log('save')
		data.save();
	}
}

function isGeoCoded(tweet)
{
	var ret = false;
	if(tweet.coordinates !==null)
		ret = true;
	else
	{
		if(tweet.place !== null)
		{
			var coord = tweet.place[0]["box"][0]["coordinates"][0][0];
			tweet.coordinates = coord;	
			ret = true;
		}
	}
	return ret;
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
	if(interval != null && interval !== undefined)
		clearInterval(interval);
	if(liveinterval != null && liveinterval !== undefined)
		clearInterval(liveinterval);
	dataBufferReset();
	classificationReset();
}

function _startAsyncEvents(){
	liveinterval = setInterval(function() {	
		if(dataBuffer.length>1 && cb_live !==undefined)
		{
			cb_live(dataBuffer[0]);//Sending live tweet to frontend every 5 seconds
			addIntoHashTable();
			generateTopK();
			persistTweets();
			console.log(dataBuffer.length + ' tweet processed');
			dataBufferReset();
		}
	},3*1000);
}

var stream = {
	getData: _get_,
	register: _register_,
	append: _append_,
	stop: _stop_,
	register_live:_registerlive_,
	register_top:_register_top,
	startAsyncEvents: _startAsyncEvents,
	classtoString:_mapperToString,
	classToId:_mapperToId,
	getTopKWords:_getTopKWords
};

module.exports = stream;
