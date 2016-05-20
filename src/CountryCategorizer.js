//Country Categorizer
//Normalizes tweets for country and each of its states
/*
var request = require('request');
var country = require('countryjs');
var HashTable = require('hashtable');
var categories = 4;

function StateStats(population){
	this.population = population
	this.total = 0;
	this.categoryCount = new Array(categories);
	this.setCategory = function(idx){
		this.categoryCount[idx]++;
		this.total++;
	}
};

function CountryCategorizer(name,categoryCount){
	this.country = country;
	this.categories = new Array(categoryCount);
	var states = country.states(name);
	var idx=0;
	this.hashtable = new HashTable();
	for(;idx<states.length;idx++)
	{
		this.hashtable.put(states[idx],new StateStats(0));
	}
}

CountryCategorizer.prototype.categorizePerState = function(tweet){
	console.log(tweet)
	reverse(tweet.coordinates[0],tweet.coordinates[1] ,function(err,body){
		if(err)
		{

		}
		else
		{
			//console.log(body);
		}
	});
}


var reverse = function(lat, lon, cb){
	console.log("lattit "+lat+ " long "+lon+'\n');
    request({
      url : 'http://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lon+'&addressdetails=1',
      headers : {
        'User-Agent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36'
      }
    }, function (err, res, body) {
      if(!err && body){
        body = JSON.parse(body);
      }
      else if(err){
        console.log(err);
      }
      console.log(body);
      cb(err,body);
    });
}

//reverse(40.7181997,-73.997953);

module.exports = CountryCategorizer;
*/