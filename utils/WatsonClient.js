//This is the client that interacts with watson server
//var http = require('http');
var request = require('request');
var xmlToJson = require('xml2json');
var config = require('../config');
var keys = [config.watson.apikey1, config.watson.apikey2, config.watson.apikey3];
var currIdx=0;

function rotate()
{
	if(currIdx+1 > keys.length)
		currIdx=currIdx%(keys.length-1);
	else
		currIdx++;
}

module.exports.getEmotions = function(queryString,myCallback){
	//console.log(queryString+'\n');
	var options = {
	    url: config.watson.url, //URL to hit
	    qs: {apikey: keys[currIdx], text: queryString}, //Query string data
	    method: 'GET', //Specify the method
	    headers: { //We can define headers too
	        'Content-Type': 'application/json'
	    }
	};
	//options.qs.text = myData;
	//return;
	var JsonConverter;
	request(options , function(error, response, body){
	    if(error) {
	        console.log(error);
	    } else {
	    	JsonConverter = xmlToJson.toJson(body);
			JsonConverter = JSON.parse(JsonConverter);
			if(JsonConverter["statusInfo"] ==undefined)
				myCallback(JsonConverter.results.docEmotions);
			else
				rotate();//It means something is wrong

	    }
	});
}