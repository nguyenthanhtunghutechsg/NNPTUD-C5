let mongoose = require('mongoose');

let productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String
    },
    price: {
        type: Number,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        default: true,
        maxLength: 999
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: true
    },
    images: {
        type: [String],
        default: [
            "https://placeimg.com/640/480/any"
        ]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})
module.exports = new mongoose.model('product', productSchema)