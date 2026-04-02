var express = require('express');
var router = express.Router();
let { checkLogin } = require('../utils/authHandler')
let { uploadImage } = require('../utils/uploadHandler')
let userSchema = require('../schemas/users')
let messageSchema = require('../schemas/messages')
router.post('/', checkLogin, uploadImage.single('file'), async function (req, res, next) {
    let user01 = req.user._id;
    let user02 = req.body.to;
    let getUser = await userSchema.findById(user02);
    if (!getUser) {
        res.status(404).send({
            message: 'user khong ton tai'
        })
    }
    let message = {};
    if (req.file) {
        message.type = 'file';
        message.text = req.file.path
    } else {
        message.type = 'text';
        message.text = req.body.text
    }
    let newMess = new messageSchema({
        from: user01,
        to: user02,
        messageContent: message
    })
    await newMess.save();
    res.send(newMess)
})
router.get('/:userid', checkLogin, async function (req, res, next) {
    let user01 = req.user._id;
    let user02 = req.params.userid;
    let getUser = await userSchema.findById(user02);
    if (!getUser) {
        res.status(404).send({
            message: 'user khong ton tai'
        })
    }
    let messages = await messageSchema.find({
        $or: [{
            from: user01,
            to: user02
        }, {
            to: user01,
            from: user02
        }]
    }).sort({
        createdAt: -1
    })
    res.send(messages)
})
router.get('/', checkLogin, async function (req, res, next) {
    let user01 = req.user._id;

    let messages = await messageSchema.find({
        $or: [{
            from: user01
        }, {
            to: user01
        }]
    }).sort({
        createdAt: -1
    })
    let messsageMap = new Map();
    for (const message of messages) {
        let user02 = user01.toString() == message.from.toString() ? message.to.toString() : message.from.toString();
        if (!messsageMap.has(user02)) {
            messsageMap.set(user02, message)
        }
    }
    let result = [];
    messsageMap.forEach(function (value, key) {
        result.push({
            user:key,
            message: value
        })
    })
    res.send(result)
})

module.exports = router;