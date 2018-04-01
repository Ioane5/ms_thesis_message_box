var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL);

var messageSchema = mongoose.Schema({
    message: String,
    sharedWith: [String]
});

messageSchema.index({sharedWith: 1});

var Message = mongoose.model("Message", messageSchema);

router.get('/:id', function (req, res) {
    Message.find({'_id': req.params.id}, function (err, message) {
        if (err) {
            res.status(404);
            res.send('object not found');
        }
        res.send(message);
    });
});

router.get('/list/:id', function (req, res) {
    Message.find({sharedWith: req.params.id}, function (err, messageList) {
        if (err) {
            res.status(404);
            res.send('object not found');
        } else {
            res.send(messageList);
        }
    });
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