var express = require('express');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var app = express();
var PORT_NUM = 3333;

	
app.use('/', express.static(__dirname + "/app/"));


app.listen(PORT_NUM);
console.log("Application running on port : "+ PORT_NUM);