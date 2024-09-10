import jwt from 'jsonwebtoken';
// Middleware to verify JWT and extract user info
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        res.sendStatus(401);
        return; /* In JS, return res.sendStatus() but here
        it is not like that bcz this middleware function expects
        void to be returned... so only return;
        */
    }
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        if (user) {
            req.user = user; // Attach user to the request object
        }
        next();
    });
};
// Middleware to check admin role
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied.' });
        return; // return void...
    }
    next();
};
export { authenticateToken, isAdmin };
