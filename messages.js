var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@ds243418.mlab.com:43418/message-box');

var messageSchema = mongoose.Schema({
    message: String,
    sharedWith: Array
});

var Message = mongoose.model("Message", messageSchema);

router.get('/', function (req, res) {
    res.send('GET route on things.');
});

router.post('/', function (req, res) {
    var messageInfo = req.body;
    if (!messageInfo.message || !messageInfo.sharedWith || messageInfo.sharedWith.length < 1) {
        res.status(400);
        res.send('Invalid Request');
    } else {
        var newMessage = new Message({
            message: messageInfo.message,
            sharedWith: messageInfo.sharedWith
        });

        newMessage.save(function (err, Message) {
            if (err) {
                console.log(err);
                res.status(500);
                res.send('Error, could not save');
            }
            else
                res.send('Message Saved!');
        });
    }
});

//export this router to use in our index.js
module.exports = router;