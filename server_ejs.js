var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var MongoClient = require('mongodb').MongoClient; 
var mongourl = 'mongodb://omegalul:1234Ll1234@ds123444.mlab.com:23444/groupomegalul';

app = express();
app.set('view engine','ejs');

var SECRETKEY1 = 'I want to pass COMPS381F';
var SECRETKEY2 = 'LUL';

var users = new Array(
	{name: 'developer', password: 'developer'},
	{name: 'demo', password: ''}
);

var products = [
	{name: 'Apple iPad Pro', stock: 100, price: 7000, id:'001'},
	{name: 'Apple iPhone 7', stock: 50, price: 7800, id:'002'},
];

var restaurants = [];

app.set('view engine','ejs');

app.use(session({name: 'session',keys: [SECRETKEY1,SECRETKEY2]}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

var username
var db;
function connectDB(){
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
	})
	return db;
}


app.get('/',function(req,res) {
	console.log(req.session);
	if (req.session.length == 0 || req.session == null) {
		res.redirect('/login');
	} else {
		res.status(200);
		res.redirect('/read');
	}
});
app.get('/read', function(req,res) {
	username = req.session.username;
	res.render('list', {c: products,username});
});

app.get('/createUser', function(req,res) {
	res.sendFile(__dirname + '/public/register.html');
});
app.post('/createUser', function(req,res) {
	db = connectDB();///database access
	username = req.query.user;
	if(true){//check username duplicated
		res.status(200).write("<html>Account Name Used!");
		res.end('<script>function goBack() {window.history.back();}</script><button onclick="goBack()">Go Back</button></html>');	
	}else{
		var record = {};
		record["Name"] = req.query.name;
		record["Password"] = req.query.password;
		db.collection('users').insertOne(record,function(err,result) {
			assert.equal(err,null);
			console.log("Created New Restaurant!");
			console.log(JSON.stringify(result));
			callback(result);
		});
		res.status(200).write("<html>Created New Account!");
		res.end('<script>function goBack() {window.history.back();}</script><button onclick="goBack()">Go Back</button></html>');
	}
});

app.get('/login',function(req,res) {
	res.sendFile(__dirname + '/public/login.html');
});

app.post('/login',function(req,res) {
	db = connectDB();//database access
	for (var i=0; i<users.length; i++) {
		if (users[i].name == req.body.name &&
		    users[i].password == req.body.password) {
			req.session.authenticated = true;
			req.session.username = users[i].name;
			username = req.session.username;
			break;
		}
	}
	res.redirect('/');
});
app.get('/logout',function(req,res) {
	req.session = null;
	res.redirect('/');
});


app.get('/createRestaurant', function(req,res) {
	username = req.session.username;
	res.render('createRestaurant', {username});
});
app.post('/createRestaurant', function(req,res) {
	var record = {};
	record["Name"] = req.query.name;
	record["borough"] = req.query.borough;	
	record["Cuisine"] = req.query.cuisine;
	
	record["Photo"] = new Buffer(req.query.photo).toString('base64');
		
	record["Mimetype"] = ".jpeg";//files.filetoupload.type;

	var address = {};	
	address["Street"] = req.query.street;
	address["Building"] = req.query.building;
	address["Zipcode"] = req.query.zipcode;
	var coord = {};
	coord["GPS1"] = "";
	coord["GPS2"] = "";
	address["coord"] = coord;
	record["Address"] = address

	var grade = {};
	grade["user"] = "";
	grade["score"] = "";
	record["Grade"] = grade;	
	
	record["Owner"] = req.session.username;	
	record[] = 
	db.collection('restaurants').insertOne(record,function(err,result) {
		assert.equal(err,null);
		console.log("Created New Restaurant!");
		console.log(JSON.stringify(result));
		callback(result);
	});
	res.status(200).write("<html>Created New Restaurant!");
	res.end('<script>function goBack() {window.history.back();}</script><button onclick="goBack()">Go Back</button></html>');	
});
app.get('/showdetails', function(req,res) {
	var product = null;
	if (req.query.id) {
		for (i in products) {
			if (products[i].id == req.query.id) {
				product = products[i]
				break;
			}
		}
		if (product) {
			res.render('details', {c: products[i]});							
		} else {
			res.status(500).end(req.query.id + ' not found!');
		}
	} else {
		res.status(500).end('id missing!');
	}
});


app.get('/rateRestaurant', function(req,res) {
	db.collection('restaurant').insertOne(r,function(err,result) {
		assert.equal(err,null);
		console.log("Insert was successful!");
		console.log(JSON.stringify(result));
		callback(result);
	});
	res.status(200).end('TEST FOR rate!');	
});
app.post('/deleteRestaurant',function(req,res) {
	for (var i=0; i<restaurant.length; i++) {
		if (restaurant[i].id == req.body.id &&
		    restaurant[i].user == req.body.user) {
			req.session.authenticated = true;
			req.session.username = users[i].name;
		}
	}
	res.redirect('/');
});

app.get('*',function(req,res){
    res.status(404).end('File not found');
});

app.listen(process.env.PORT || 8099);
