const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 letters"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be atc least 6 characters"),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

const registerUser = async (req, res) => {
    try {
        const validation = registerSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                errors: z.flattenError(validation.error)
            })
        }

        const { name, email, password } = validation.data;

        const userExist = await User.findOne({email});
        if (userExist) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, 
            email,
            password: hashedPassword,
        });

        if(user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({
                message: 'Invalid user data'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const loginUser = async (req, res) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                error: z.flattenError(validation.error)
            });
        }

        const user = await User.findOne({ email });

        if(user && (await bcrypt.compare(password, user.password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { registerUser, loginUser};