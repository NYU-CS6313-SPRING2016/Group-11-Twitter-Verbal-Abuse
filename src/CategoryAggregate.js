//categorize function
// Will categorize every tweet and insert into db

module.exports = function (){
	function CategoryAggregate(name, data, timestamp) {
	  this.name = name;
	  this.data = data;
	  this.timestamp = timestamp;
	};

	CategoryAggregate.prototype.toString = function() {
		console.log(this.name + ' ' + this.data + ' '+ this.timestamp);
	}
};