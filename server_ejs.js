var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var app = express();
var MongoClient = require('mongodb').MongoClient; 
//var mongourl = 'mongodb://omegalul:1234Ll1234@ds123444.mlab.com:23444/groupomegalul';
const mongourl = "mongodb://labuser:password0@ds245532.mlab.com:45532/omegalulxd";

app = express();
app.set('view engine','ejs');

var SECRETKEY1 = 'Omega';
var SECRETKEY2 = 'LUL';

var users = new Array(
	{name: 'developer', password: 'developer'},
	{name: 'demo', password: ''}
);

var products = [
	{name: 'Apple iPad Pro', stock: 100, price: 7000, id:'001'},
	{name: 'Apple iPhone 7', stock: 50, price: 7800, id:'002'},
];


app.set('view engine','ejs');

app.use(session({name: 'session',keys: [SECRETKEY1,SECRETKEY2]}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

var username;
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
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);
		}
		catch(err){
			res.set({"Content-Type":"text/plain"});
			res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		var record = {};
		find_detail(db,record,function(result){
			res.render('list',{c: result,username});
		});
		db.close();
	});
});
function find_detail(db,r,callback){
	var result = db.collection("restaurants").find(r);
	//var result = db.collection("restaurants").find({},{_id:0 , Name:1})	
	//console.log("testing "+result);
	var result0 = [];
	result.each(function(err,doc) {
		if (doc != null) {
			//console.log("a thing get from database:"+doc);
			result0.push(doc);
		} else {
			callback(result0);
			db.close();
		}
	});
}

app.get('/createUser', function(req,res) {
	res.sendFile(__dirname + '/public/register.html');
});
app.post('/createUser', function(req,res) {
	username = req.query.user;	
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);	
			console.log('Connected to MongoDB\n');	
		}
		catch(err){
 			res.set({"Content-Type":"text/plain"});
           		res.status(500).end("MongoClient connect() failed!");
		}
		var username_check = {};
		username_check["Name"] = req.body.name;
		User_check(db,username_check,function(result){
			if(result!=null){
				res.status(200).write("<html>Account Name Used!");
				res.end('<br/><form action="read" method="get"><input type="submit" value="Return Home"></form></html>');	
			}else{
				var record = {};
				record["Name"] = req.body.name;
				record["Password"] = req.body.password;
				createUser(db,record,function(result){
					db.close();
					console.log("Created New Account!");
					res.status(200).write("<html>Created New Account!");
					res.end('<br/><form action="read" method="get"><input type="submit" value="Return Home"></form></html>');
				});
			}
	        });
	});
});
function createUser(db,r,callback){
	db.collection('users').insertOne(r,function(err,result) {
		assert.equal(err,null);
		console.log("insert was successful!");
		console.log(JSON.stringify(result));
		callback(result);
	});
}
function User_check(db,r,callback){
	db.collection('users').findOne(r,function(err,result) {
		assert.equal(err,null);
		console.log("check finished :"+JSON.stringify(result));
		callback(result);
	});
}

app.get('/login',function(req,res) {
	res.sendFile(__dirname + '/public/login.html');
	if(req.session.length != 0 && req.session != null){
		res.status(200);
		res.redirect('/read');
	}
});

app.post('/login',function(req,res) {
	if(req.session.length != 0 && req.session != null){
		res.status(200);
		res.redirect('/read');
	}
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);
		}
		catch(err){
			res.set({"Content-Type":"text/plain"});
			res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		var username_check = {};
		username_check["Name"] = req.body.name;
		username_check["Password"] = req.body.password;
		User_check(db,username_check,function(result){
			db.close();
			if (result!=null) { //user exist
				console.log(result["Name"]+" Account login!");
				req.session.authenticated = true;
				req.session.username = result["Name"];
				console.log(req.session.authenticated);
				console.log(req.session.username);
				res.status(200).write("<html>Login Successful");
				res.end('<br/><script>function goBack() {window.history.back();}</script><button onclick="goBack()">Start</button></html>');
			} else {
				res.status(200).write("<html>Account not existes or wrong password!");
				res.end('<br/><form action="read" method="get"><input type="submit" value="Return Home"></form></html>');
			}
		});
	});
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
	username = req.session.username;	
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);		
		}
		catch(err){
 			res.set({"Content-Type":"text/plain"});
           		res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		
		var record = {};
		record["Name"] = req.body.name;
		record["Borough"] = req.body.borough;	
		record["Cuisine"] = req.body.cuisine;
	
		//record["Photo"] = new Buffer(req.query.photo).toString('base64');
		record["Photo"] = req.body.photo;	
		record["Mimetype"] = ".jpeg";//files.filetoupload.type;

		var address = {};	
		address["Street"] = req.body.street;
		address["Building"] = req.body.building;
		address["Zipcode"] = req.body.zipcode;
		var coord = {};
		coord["GPS1"] = req.body.gps1;
		coord["GPS2"] = req.body.gps2;
		address["coord"] = coord;
		record["Address"] = address
		
		var grade = {};
		grade["user"] = null;
		grade["score"] = null;
		record["Grade"] = [grade];	
	
		record["Owner"] = username;
		//console.log(record);	
		createRestaurant(db,record,function(result){
			db.close();
			console.log("Created New Restaurant!");
			res.status(200).write("<html>Created New Restaurant!");
			res.end('<br/><form action="read" method="get"><input type="submit" value="Return Home"></form></html>');
		});
	});	
});
function createRestaurant(db,r,callback){
	db.collection('restaurants').insertOne(r,function(err,result) {
		assert.equal(err,null);
		console.log("insert was successful!");
		console.log(JSON.stringify(result));
		callback(result);
	});
}

app.get('/showdetails', function(req,res) {
	MongoClient.connect(mongourl, function(err, db) {
	try{
		assert.equal(err,null);
        }
        catch(err){
		res.set({"Content-Type":"text/plain"});
		res.status(500).end("MongoClient connect() failed!");
        }
	var record = {};
	var test1 = req.query._id;
	var username = req.session.username;
	record["_id"] = ObjectId(test1);
	console.log(record);
	find_detail(db,record,function(result){
		res.render('details',{c: result,username});
        });
        db.close();
    });	
});
app.get('/map', function(req,res) {
	var lat = req.query.lat;
	var lon = req.query.lon;
	console.log(lat+"test"+lon)
	res.render('map',{lat,lon});//can't generate if 2 val is not correct
});

app.get('/rateRestaurant', function(req,res) {
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);
		}
		catch(err){
			res.set({"Content-Type":"text/plain"});
			res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		var record = {};
		var test1 = req.query._id;
		var username = req.session.username;
		record["_id"] = ObjectId(test1);
		find_detail(db,record,function(result){
			res.render('rateRestaurant',{c: result,username});
		});
		db.close();
	});

});
app.post('/rateRestaurant', function(req,res) {
	username = req.session.username;
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);		
		}
		catch(err){
 			res.set({"Content-Type":"text/plain"});
           		res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		var rid = req.body.h_id;
		var record = {};
		record["user"] = req.session.username;
		record["score"] = req.body.rate;
		console.log(rid);
		console.log(record);
		rateRestaurant(db,rid,record,function(result){
			db.close();
			console.log("Rated Restaurant!");
			res.status(200).write("<html>Rated Restaurant!");
			res.end('<br/><form action="read" method="get"><input type="submit" value="Return Home"></form></html>');
		});
	});	
});
function rateRestaurant(db,rid,record,callback){
	var result = db.collection('restaurants').update({_id:ObjectId(rid)},{"$push": {Grade: record}});
	callback(result);
}

app.get('/search', function(req,res) {
	username = req.session.username;
	res.render('search', {username});
});

app.post('/search', function(req,res) {
    MongoClient.connect(mongourl, function(err, db) {
        try{
		assert.equal(err,null);
        }
        catch(err){
		res.set({"Content-Type":"text/plain"});
		res.status(500).end("MongoClient connect() failed!");
        }
        var item = {};
        if (req.body.name){
		item["Name"] = req.body.name;
		console.log(item);
        }
        if (req.body.borough){
           	item["Borough"] = req.body.borough;
		console.log(item);
        }
        if (req.body.cuisine){
          	item["Cuisine"] = req.body.cuisine;
		console.log(item);
        }
	
        find_detail(db,item,function(result){
        	 if (result){
			console.log(result);
         		res.render('search_answer',{r: result});
        	} else {
			res.status(200).write("<html>No matched record!");
			res.end('<br/><script>function goBack() {window.history.back();}</script><button onclick="goBack()">Go Back</button></html>');
            }
        });
        db.close();
    });
});

app.get('/deleteRestaurant', function(req,res) {
	MongoClient.connect(mongourl, function(err, db) {	
		var record = {};
		var test1 = req.query._id;
		record["_id"] = ObjectId(test1);
		console.log(record);
		deleteRestaurant(db,record,function(result){
			//res.render('details',{c: result});        
		});
		db.close();
	});
	res.redirect('/');
});
function deleteRestaurant(db,r,callback){
	db.collection('restaurants').remove(r,function(err,result) {
		assert.equal(err,null);
		console.log("remove was successful!");
		console.log(JSON.stringify(result));
		callback(result);
	});
}

app.get('/updateRestaurant', function(req,res) {
	username = req.session.username;
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);
		}
		catch(err){
			res.set({"Content-Type":"text/plain"});
			res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		var record = {};
		var test1 = req.query._id;
		var username = req.session.username;
		record["_id"] = ObjectId(test1);
		find_detail(db,record,function(result){
			res.render('updateRestaurant',{c: result,username});
		});
		db.close();
	});

});
app.post('/updateRestaurant', function(req,res) {
	username = req.session.username;	
	MongoClient.connect(mongourl, function(err, db) {
		try{
			assert.equal(err,null);		
		}
		catch(err){
 			res.set({"Content-Type":"text/plain"});
           		res.status(500).end("MongoClient connect() failed!");
		}
		console.log('Connected to MongoDB\n');
		var record = {};
		var rid = req.body.h_id;	
		record["Name"] = req.body.name;
		record["Borough"] = req.body.borough;	
		record["Cuisine"] = req.body.cuisine;
		//record["Photo"] = new Buffer(req.query.photo).toString('base64');
		record["Photo"] = req.body.photo;	
		record["Mimetype"] = ".jpeg";//files.filetoupload.type;

		var address = {};	
		address["Street"] = req.body.street;
		address["Building"] = req.body.building;
		address["Zipcode"] = req.body.zipcode;
		var coord = {};
		coord["GPS1"] = req.body.gps1;
		coord["GPS2"] = req.body.gps2;
		address["coord"] = coord;
		record["Address"] = address;
		var set = {$set: {name: req.body.name}};
		console.log(rid);
		console.log(record);
		updateRestaurant(db,rid,record,function(result){
			db.close();
			console.log("Updated Restaurant!");
			res.status(200).write("<html>Updated Restaurant!");
			res.end('<br/><form action="read" method="get"><input type="submit" value="Return Home"></form></html>');
		});
	});	
});
function updateRestaurant(db,rid,record,callback){
	var result = db.collection('restaurants').update({_id:ObjectId(rid)},{$set: record});
	callback(result);
}
////
app.get('/api/restaurant/name/:xxx',function(req,res){
	MongoClient.connect(mongourl, function(err, db) {
    try{
        assert.equal(err,null);
    }
    catch(err){
	res.set({"Content-Type":"text/plain"});
        res.status(500).end("MongoClient connect() failed!");
    }
    var item = {};
    item["Name"] = req.params.xxx;
    find_detail(db,item,function(result){
    if (result){
        res.status(200).json(result).end();
    } else {
        res.status(200).write("{}");}
    });
	});
});
function updateRestaurant(db,rid,record,callback){
	var result = db.collection('restaurants').update({_id:ObjectId(rid)},{$set: record});
	callback(result);
}
////
app.get('/api/restaurant/borough/:xxx',function(req,res){
	MongoClient.connect(mongourl, function(err, db) {
    try{
        assert.equal(err,null);
    }
    catch(err){
	res.set({"Content-Type":"text/plain"});
        res.status(500).end("MongoClient connect() failed!");
    }
    var item = {};
    item["Borough"] = req.params.xxx;
    find_detail(db,item,function(result){
    if (result){
        res.status(200).json(result).end();
    } else {
        res.status(200).write("{}");}
    });
	});
});
function updateRestaurant(db,rid,record,callback){
	var result = db.collection('restaurants').update({_id:ObjectId(rid)},{$set: record});
	callback(result);
}
////
app.get('/api/restaurant/cuisine/:xxx',function(req,res){
	MongoClient.connect(mongourl, function(err, db) {
    try{
        assert.equal(err,null);
    }
    catch(err){
	res.set({"Content-Type":"text/plain"});
        res.status(500).end("MongoClient connect() failed!");
    }
    var item = {};
    item["Cuisine"] = req.params.xxx;
    find_detail(db,item,function(result){
    if (result){
        res.status(200).json(result).end();
    } else {
        res.status(200).write("{}");}
    });
	});
});


app.get('*',function(req,res){
    res.status(404).end('File not found');
});

app.listen(process.env.PORT || 8099);
