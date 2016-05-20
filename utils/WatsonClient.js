//This is the client that interacts with watson server
//var http = require('http');
var request = require('request');
var xmlToJson = require('xml2json');
var config = require('../config');
var keys = [config.watson.apikey1, config.watson.apikey2, config.watson.apikey3, config.watson.apikey4, config.watson.apikey5, config.watson.apikey6];
var currIdx=0;

function rotate()
{
	if(currIdx+1 > keys.length)
		currIdx=currIdx%(keys.length-1);
	else
		currIdx++;
}

module.exports.getEmotions = function(queryString,myCallback){
	//myCallback(undefined);//addedsince api reaches limit, TODO:// comment during demo
	//return;
	var options = {
	    url: config.watson.url,
	    qs: {apikey: keys[currIdx], text: queryString},
	    method: 'GET',
	    headers: { 
	        'Content-Type': 'application/json'
	    }
	};
	var emotionObj;
	request(options , function(error, response, body){
	    if(error) {
	        console.log(error);
	        myCallback(undefined);
	    } else {
	    	emotionObj = xmlToJson.toJson(body);
			emotionObj = JSON.parse(emotionObj); 
			if(emotionObj["results"]["statusInfo"] ==undefined)
				myCallback(emotionObj.results.docEmotions);
			else
			{
				rotate();//It means something is wrong
				myCallback(undefined);
			}

	    }
	});
}