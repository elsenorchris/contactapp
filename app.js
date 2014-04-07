
//module dependencies
var express = require('express')
  , http = require('http')
  , mysql = require('mysql')
  , path = require('path')
  , wunderbar = require('wunderbar')
  , weather   = new wunderbar('820ac03eb043fa7c')
  , mymodule = require('./weather.js');


var app = express();

// all environments
app.set('port', process.env.PORT || 3002);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function( req, res) {
	weather.conditions('32608', function(err, weatherstring) {
	res.render('index',{currentweather: weatherstring.current_observation.weather,
	 winds: weatherstring.current_observation.wind_string,
	 currenttemp: weatherstring.current_observation.temperature_string,
	 feelslike: weatherstring.current_observation.feelslike_string,
	 gainsevillepic: weatherstring.current_observation.image.url	});
});

});


//connect to mysql database
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'bluJay11',
	database : 'nodejsmysql'
});
connection.connect();

app.get('/users', function (req, res) {
	connection.query('select * from nodejs', function(err, docs) {
	res.render('users', {users: docs});
	});

});



// Add a new User
app.get("/users/new", function (req, res) {
	res.render("new");
});

// Save the Newly created User
app.post("/users", function (req, res) {
	mymodule(req.body.zipcode, function(err, weath, loc, temp, up){
			
	if(weath){

	var fname=req.body.fname,
		lname=req.body.lname,
		address=req.body.address,
		zipcode=req.body.zipcode,
		phonenumber=req.body.phonenumber;
	connection.query('INSERT INTO nodejs (fname, lname, address, zipcode, phonenumber, lupdate, weather, location, temperature) VALUES (?, ?, ? ,?, ?, ?, ?, ?, ?);', [fname, lname, address, zipcode, phonenumber, up, weath, loc, temp], function(err, docs) {
	console.log("inserted new user!");
	if (err) res.json(err);
	res.redirect('users');
		});
	}
	else
		res.json("ZIPCODE DOESNT EXIST! PRESS BACKSPACE TRY AGAIN");
	
	});
});

//delete a contact
app.post('/users/delete', function(req, res) {
	var del = req.body.id;
	connection.query('DELETE FROM nodejs WHERE id = (?);',[del], function(err, docs) {
	console.log("deleted user!");
	if (err) res.json(err);
	res.redirect('users');
		});
	});

//edit a contact
app.post("/users/edit", function (req, res) {
	res.render("edit", {id: req.body.id, fname: req.body.fname, lname:req.body.lname, address: req.body.address, zip: req.body.zipcode, phone: req.body.phonenumber});
});

//edit a contact
app.post("/users/edit/sug", function (req, res) {
	mymodule(req.body.zipcode, function(err, weath, loc, temp, up){
			
	if(weath){
	var fname=req.body.fname,
		lname=req.body.lname
		address=req.body.address,
		zipcode=req.body.zipcode,
		phonenumber=req.body.phonenumber,

	connection.query('UPDATE nodejs SET fname=(?), lname=(?), address=(?), zipcode=(?), phonenumber=(?), weather=(?), location=(?), temperature=(?), lupdate=(?) WHERE id=(?)', 
		[fname, lname, address, zipcode, phonenumber, weath, loc, temp, up, req.body.id], function(err, docs) {
	console.log("editted user!");
	if (err) res.json(err);
	res.redirect('users');
		});
	}
	else
		res.json("ZIPCODE DOESNT EXIST! PRESS BACKSPACE TRY AGAIN");
	
	});
});

// Search for user
app.get("/users/search", function (req, res) {
	res.render("search");
});

//search for letter
app.post("/users/search/letter", function (req, res) {
	var letter= req.body.letter+'%';

	connection.query("SELECT * FROM nodejs WHERE lname LIKE (?)",[letter], function(err, docs) {
	if (err) res.json(err);
	res.render('specific',{users: docs, letter: req.body.letter});

		});
	});

//update weather
app.post("/users/weather", function (req, res) {
	mymodule(req.body.zipcode, function(err, weath, loc, temp, up, currentup){

	connection.query('UPDATE nodejs SET weather=(?), location=(?), temperature=(?), lupdate=(?) WHERE id=(?)', 
		[weath, loc, temp, up, req.body.id], function(err, docs) {
	console.log("Updated weather!");
	if (err) res.json(err);
	res.render('weather',{name: req.body.name, address: req.body.address, current: currentup, weather: weath, location: loc, temperature: temp, update: up} );
		});
	
	
	});
});


//create server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
