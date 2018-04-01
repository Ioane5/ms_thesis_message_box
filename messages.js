var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@ds243418.mlab.com:43418/message-box');

var messageSchema = mongoose.Schema({
    message: String,
    sharedWith: [String]
});

messageSchema.index({sharedWith: 1});

var Message = mongoose.model("Message", messageSchema);

// assign a function to the "methods" object of our animalSchema
messageSchema.methods.findSharedWith = function (key) {
    return this.model('Message').find({sharedWith: key}, {'_id': 1});
};

router.get('/:id', function (req, res) {
    var message = Message.find({'_id': req.params.id});
    if (message) {
        res.send(JSON.stringify(message.lean()));
    } else {
        res.status(404);
        res.send('object not found');
    }
});

router.get('/list/:id', function (req, res) {
    var messageList = Message.findSharedWith(req.params.id);
    if (messageList) {
        res.send(JSON.stringify(messageList.lean()));
    } else {
        res.status(404);
        res.send('object not found');
    }
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