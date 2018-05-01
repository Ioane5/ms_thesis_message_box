var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL);

var messageSchema = mongoose.Schema({
    message: String,
    sharedWith: [String],
    key: String,
    public: Boolean,
    author: String
});

messageSchema.index({sharedWith: 1});

var Message = mongoose.model("Message", messageSchema);

router.get('/:id', function (req, res) {
    var messageId = req.params.id;
    var userId = req.param('userId');

    Message.find({'_id': messageId, sharedWith: userId}, function (err, message) {
        if (err || message.length < 1) {
            res.status(404);
            res.send('object not found');
        } else {
            var messageResponse = message[0];
            res.send(messageResponse);
        }
    });
});

router.delete('/:id', function (req, res) {
    var messageId = req.params.id;
    var userId = req.param('userId');

    Message.findOne({_id: messageId}, function (error, doc) {
        if (error || !doc.sharedWith) {
            res.send(null, 404);
        } else {
            // Public documents only can be deleted by author
            if (doc.public) {
                if (doc.author == userId) {
                    doc.delete()
                } else {
                    res.send('only author can delete public message', 401);
                }
            } else if (doc.sharedWith) {
                var index = doc.sharedWith.indexOf(userId);
                doc.sharedWith.splice(index, 1);
                doc.save(function (error) {
                    if (error) {
                        console.log(error);
                        res.send(null, 500);
                    } else {
                        res.send(200);
                    }
                });
            } else {
                res.send(null, 404);
            }
        }
    });
});

/**
 * Deletes message if everybody has downloaded
 */
function cleanupMessageAfterDownload(message, userId) {
    if (!message.public && message.sharedWith) {
        message.sharedWith.splice(message.sharedWith.indexOf(userId), 1);
        if (message.sharedWith.length < 1) {
            console.log("deleted message : " + message._id);
            // Delete
            Message.delete(message);
        } else {
            console.log("removed sharedWith : " + message._id);
            // save
            Message.update(message, false);
        }
    }
}

/**
 * Get list of messages for user
 */
router.get('/list/:id', function (req, res) {
    Message.find({sharedWith: req.params.id}, {'_id': 1}, function (err, messageList) {
        if (err) {
            res.status(404);
            res.send('object not found');
        } else {
            res.send(messageList.map(function (item) {
                return item._id;
            }));
        }
    });
});

router.post('/', function (req, res) {
    var messageInfo = req.body;
    if (!messageInfo || !messageInfo.message || !messageInfo.sharedWith || messageInfo.sharedWith.length < 1) {
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


/**
 * API for Public messages
 */

/**
 * List messages by Public Key
 */
router.get('/public/list/:key', function (req, res) {
    Message.find({'key': req.params.key, 'public': true}, function (err, messageList) {
        if (err) {
            res.status(404);
            res.send('object not found');
        } else {
            res.send(messageList.map(function (item) {
                return item._id;
            }));
        }
    });
});

/**
 * Save public message
 */
router.post('/public', function (req, res) {
    var messageInfo = req.body;
    if (!messageInfo || !messageInfo.message || !messageInfo.key) {
        res.status(400);
        res.send('Invalid Request');
    } else {
        var newMessage = new Message({
            message: messageInfo.message,
            key: messageInfo.key,
            public: true
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

router.get('/public/:id', function (req, res) {
    Message.find({'_id': req.params.id, 'public': true}, function (err, message) {
        if (err || message.length < 1) {
            res.status(404);
            res.send('object not found');
        } else {
            res.send(message[0]);
        }
    });
});

//export this router to use in our index.js
module.exports = router;