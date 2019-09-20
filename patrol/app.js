var express = require('express')
  , app = express() 
  , bodyParser = require('body-parser')
var config = require("./config/config")
var serverPort = config.serverPort
// app.set('view engine', 'html');
// app.set('views', ['views']);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var fs = require('fs');
var http = require('http');
var dbConnection = require('./config/db');
var db = new dbConnection();


http.createServer(app).listen(serverPort, function () {
	console.log('server running on port : %d', serverPort);
	
	require('./services/appRoutes')(app,db);
});

