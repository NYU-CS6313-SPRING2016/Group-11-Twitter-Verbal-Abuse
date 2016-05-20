//Second Stage - Emotion Filter

var WatsonClient = require('../utils/WatsonClient');
var LiveStreamer = require('./LiveStreamer');
var cb;

function _secondStage(tweet){ 
	//Filter all happy tweets out
	WatsonClient.getEmotions(tweet.content,function(data){
		var isEligible =0;
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
	    	 if(isEligible)
	    	 {
	    	 	tweet.anger = data.anger;
	    	 	tweet.disgust = data.disgust;
	    	 	tweet.sadness = data.sadness;
	    	 	tweet.joy = data.joy;
	    	 	LiveStreamer.append(tweet);
	    	 }
	    }
	    else //remove this case , its just for test!!
	    {
	    	tweet.anger = 0;
    	 	tweet.disgust = 0;
    	 	tweet.sadness = 0;
    	 	tweet.joy = 0;
    	 	LiveStreamer.append(tweet);
	    }
    });
}

var emotional = {
	secondStage: _secondStage
};

module.exports = emotional;
