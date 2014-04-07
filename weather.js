var wunderbar = require('wunderbar')
  , weather   = new wunderbar('820ac03eb043fa7c');

module.exports = function(zip,callback){

	weather.conditions(zip, function(err, weatherstring) {
		if (err)
			return callback(err);
		if(weatherstring.response.error){
			console.log("NO LOCATION");
			return callback(err);
		}

		callback(null, weatherstring.current_observation.weather, 
			weatherstring.current_observation.display_location.full, 
			weatherstring.current_observation.temperature_string,
			weatherstring.current_observation.observation_time,
			weatherstring.current_observation.local_time_rfc822)
	});

}




