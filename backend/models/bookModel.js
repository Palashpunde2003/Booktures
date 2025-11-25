const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        totalPages: {
            type: Number,
            default: 0
        },
        currentPage: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;