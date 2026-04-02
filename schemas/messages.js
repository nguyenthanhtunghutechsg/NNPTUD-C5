let mongoose = require('mongoose');
let messageContentSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ["text", "file"]
    },
    text: String
}, {
    _id: false
})
let messageSchema = mongoose.Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    messageContent: {
        type: messageContentSchema
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('message', messageSchema)