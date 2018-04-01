var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var messages = require('./messages.js');

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/messages', messages);

app.listen(process.env.PORT);