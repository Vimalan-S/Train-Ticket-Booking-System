import express from 'express';
import db from '../DB.js'; // Ensure you have proper TypeScript types for DB connections
const router = express.Router();
// Create a new user
router.post('/add', (req, res) => {
    const { name, mobilenumber, gender, role } = req.body;
    if (!name || !role) {
        return res.status(400).json({ message: 'Name and role are required.' });
    }
    const query = 'INSERT INTO User (name, mobilenumber, gender, role) VALUES (?, ?, ?, ?)';
    db.query(query, [name, mobilenumber, gender, role], (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error creating user.', err });
        res.status(201).json({ message: 'User created successfully.' });
    });
});
// Read all users
router.get('/', (req, res) => {
    const query = 'SELECT * FROM User';
    db.query(query, (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error fetching users.', err });
        res.json(results);
    });
});
// Read a user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM User WHERE userid = ?';
    db.query(query, [id], (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error fetching user.', err });
        if (results.length === 0)
            return res.status(404).json({ message: 'User not found.' });
        res.json(results[0]);
    });
});
// Update a user
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, mobilenumber, gender, role } = req.body;
    if (!name && !mobilenumber && !gender && !role) {
        return res.status(400).json({ message: 'At least one field is required for update.' });
    }
    const fields = [];
    const values = [];
    if (name) {
        fields.push('name = ?');
        values.push(name);
    }
    if (mobilenumber) {
        fields.push('mobilenumber = ?');
        values.push(mobilenumber);
    }
    if (gender) {
        fields.push('gender = ?');
        values.push(gender);
    }
    if (role) {
        fields.push('role = ?');
        values.push(role);
    }
    values.push(id);
    const query = `UPDATE User SET ${fields.join(', ')} WHERE userid = ?`;
    db.query(query, values, (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error updating user.', err });
        res.json({ message: 'User updated successfully.' });
    });
});
// Delete a user
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM User WHERE userid = ?';
    db.query(query, [id], (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error deleting user.', err });
        res.json({ message: 'User deleted successfully.' });
    });
});
// Ask for train name using full-text search
router.get('/train/:trainName', (req, res) => {
    const { trainName } = req.params;
    if (!trainName) {
        return res.status(400).json({ message: 'TrainName is required.' });
    }
    // Use FULLTEXT search with MATCH() AGAINST()
    const qry = `
    SELECT * FROM Train 
    WHERE MATCH(trainName) 
    AGAINST (? IN NATURAL LANGUAGE MODE)
  `;
    db.query(qry, [trainName], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error Fetching Train Data.', err });
        }
        res.status(200).json({ results });
    });
});
// Get available seats for a train
router.get('/seats/:trainid', (req, res) => {
    const { trainid } = req.params;
    if (!trainid) {
        return res.status(400).json({ message: 'Train ID is required.' });
    }
    const query = 'SELECT seats FROM Seats WHERE trainid = ?';
    db.query(query, [trainid], (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error fetching seats.', err });
        if (results.length === 0)
            return res.status(404).json({ message: 'Seats not found for this train.' });
        const seats = JSON.parse(results[0].seats);
        const availableSeats = Object.keys(seats).filter(key => seats[key] === 'not booked');
        res.json({ availableSeats });
    });
});
// Book a ticket
router.post('/book-ticket/:trainid/:seatNo', (req, res) => {
    var _a;
    const { trainid, seatNo } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!trainid || !seatNo || !userId) {
        return res.status(400).json({ message: 'Train ID, seat number, and user ID are required.' });
    }
    // First, check if the seat is available
    const getSeatQuery = 'SELECT seats FROM Seats WHERE trainid = ?';
    db.query(getSeatQuery, [trainid], (err, results) => {
        if (err)
            return res.status(500).json({ message: 'Error fetching seat information.', err });
        if (results.length === 0)
            return res.status(404).json({ message: 'Seats not found for this train.' });
        const seats = JSON.parse(results[0].seats);
        if (seats[seatNo] !== 'not booked') {
            return res.status(400).json({ message: 'Seat is already booked.' });
        }
        // Update the seat status to booked
        seats[seatNo] = 'booked';
        const updateSeatQuery = 'UPDATE Seats SET seats = ? WHERE trainid = ?';
        db.query(updateSeatQuery, [JSON.stringify(seats), trainid], (err) => {
            if (err)
                return res.status(500).json({ message: 'Error updating seat status.', err });
            // Insert the booking into the Ticket table
            const bookTicketQuery = 'INSERT INTO Ticket (userid, trainid, seatNo) VALUES (?, ?, ?)';
            db.query(bookTicketQuery, [userId, trainid, seatNo], (err, results) => {
                if (err)
                    return res.status(500).json({ message: 'Error booking ticket.', err });
                res.status(201).json({ message: 'Ticket booked successfully.', ticketId: results.insertId });
            });
        });
    });
});
export default router;
