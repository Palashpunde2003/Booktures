const Book = require('../models/bookModel');
const path = require('path');
const fs = require('fs');

const uploadBook = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }

        const { title } = req.body;

        const book = await Book.create({
            user: req.user._id,
            title: title,
            filePath: req.file.path,
            totalPages: 0,
        });

        res.status(201).json(book);

    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            message: error.message
        });
    }
};

const getMyBook = async (req, res) => {
    try {
        const books = await Book.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        res.json(books);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (book) {
            if (book.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({
                    message: 'Not authorised to view the book'
                });
            }
            res.json(book);
        } else {
            res.status(404).json({
                message: 'Book not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { uploadBook, getMyBook, getBookById };