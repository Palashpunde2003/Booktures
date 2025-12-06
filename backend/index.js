const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const bookRoutes = require('./routes/bookRoutes.js');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

// upload folder will be available at server - http://localhost:3000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('Booktures APT is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});