var express = require('express');
var app = express();

var messages = require('./messages.js');

app.use('messages', messages)

app.listen(3000);