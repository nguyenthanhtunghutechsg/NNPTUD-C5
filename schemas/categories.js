let mongoose = require('mongoose');
let categorySchema = mongoose.Schema({
    name: {
        type: String,
        unique: [true, "name khong duoc trung"],
        required: true
    },
    slug: {
        type: String
    },
    image: {
        type: String,
        default: 'https://placeimg.com/640/480/tech'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('category', categorySchema)