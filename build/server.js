import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './DB.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authenticateToken, isAdmin } from './middleware/authMiddleware.js';
const app = express();
app.use(express.json());
// Registration route
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err)
            return res.status(500).json({ message: 'Error hashing password.', err });
        const query = 'INSERT INTO UserCredentials (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err, results) => {
            if (err)
                return res.status(500).json({ message: 'Error creating user.', err });
            res.status(201).json({ message: 'User created successfully.' });
        });
    });
});
// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    const query = 'SELECT * FROM UserCredentials WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error fetching user.', err });
        if (results.length === 0)
            return res.status(401).json({ message: 'Invalid credentials.' });
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err)
                return res.status(500).json({ message: 'Error comparing passwords.', err });
            if (!isMatch)
                return res.status(401).json({ message: 'Invalid credentials.' });
            const token = jwt.sign({ userId: user.id, name: user.username, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ token });
        });
    });
});
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/admin', authenticateToken, isAdmin, adminRoutes);
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
