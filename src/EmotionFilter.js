//Second Stage - Emotion Filter

var WatsonClient = require('../utils/WatsonClient');
var LiveStreamer = require('./LiveStreamer');
var cb;

function _secondStage(tweet){ 
	//Filter all happy tweets out
	WatsonClient.getEmotions(tweet.content,function(data){
		var isEligible =0;
		//console.log(data);
        if(data !== undefined)
	    {
	    	if((data.anger+data.disgust) > (data.joy+data.sadness))
	    	{
	    		isEligible=1;
	    	}
	    	else if(data.fear > (data.anger + data.disgust))
	    	{
	    		if((data.anger + data.disgust) > data.joy+data.sadness)
	    			isEligible=1;
	    	}
	    	//console.log(data);
	    	 if(isEligible)
	    	 {
	    	 	LiveStreamer.append(tweet);
	    	 }
	    }
    });
}

var emotional = {
	secondStage: _secondStage
};

module.exports = emotional;
