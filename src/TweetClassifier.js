//Third stage
//Trains a classifier and provides classification

var file = require('fs');
var natural = require('natural');
var classifier;

module.exports.initClassifier = function(){
	var file1 = file.readFileSync('training.txt');
	var line = file1.toString().split("\n");
	classifier = new natural.BayesClassifier();
	line.forEach(function(line){
		var subString = line.split(",");
		classifier.addDocument(subString[0],subString[1]);
		classifier.train();
	});
}
module.exports.getClassification = function(text){
	return classifier.classify(text);
}