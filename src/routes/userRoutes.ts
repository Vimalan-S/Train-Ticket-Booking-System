import express, { Request, Response } from 'express';
import db from '../DB.js'; // Ensure you have proper TypeScript types for DB connections
import { MysqlError } from 'mysql'; // Add MySQL types

const router = express.Router();

// Define interfaces for request bodies and parameters
interface AddUserRequestBody {
  name: string;
  mobilenumber?: string;
  gender?: string;
  role: string;
}

/* When updating an user, I can change any of these attributes...
so not compulsory to enter all the attributes...
*/
interface UpdateUserRequestBody {
  name?: string;
  mobilenumber?: string;
  gender?: string;
  role?: string;
}

interface UserIdParams {
  id: string;
}

// Create a new user
router.post('/add', (req: Request<{}, {}, AddUserRequestBody>, res: Response) => {
  const { name, mobilenumber, gender, role } = req.body;
  
  if (!name || !role) {
    return res.status(400).json({ message: 'Name and role are required.' });
  }

  const query = 'INSERT INTO User (name, mobilenumber, gender, role) VALUES (?, ?, ?, ?)';
  db.query(query, [name, mobilenumber, gender, role], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error creating user.', err });
    res.status(201).json({ message: 'User created successfully.' });
  });
});

// Read all users
router.get('/', (req: Request, res: Response) => {
  const query = 'SELECT * FROM User';
  db.query(query, (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching users.', err });
    res.json(results);
  });
});

// Read a user by ID
router.get('/:id', (req: Request<UserIdParams>, res: Response) => {
  const { id } = req.params;
  const query = 'SELECT * FROM User WHERE userid = ?';
  db.query(query, [id], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching user.', err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(results[0]);
  });
});

// Update a user
router.put('/:id', (req: Request<UserIdParams, {}, UpdateUserRequestBody>, res: Response) => {
  const { id } = req.params;
  const { name, mobilenumber, gender, role } = req.body;

  if (!name && !mobilenumber && !gender && !role) {
    return res.status(400).json({ message: 'At least one field is required for update.' });
  }

  const fields: string[] = [];
  const values: any[] = [];
  
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
  db.query(query, values, (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error updating user.', err });
    res.json({ message: 'User updated successfully.' });
  });
});

// Delete a user
router.delete('/:id', (req: Request<UserIdParams>, res: Response) => {
  const { id } = req.params;
  const query = 'DELETE FROM User WHERE userid = ?';
  db.query(query, [id], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error deleting user.', err });
    res.json({ message: 'User deleted successfully.' });
  });
});


// Ask for train name using full-text search
router.get('/train/:trainName', (req: Request<{trainName: string}>, res: Response) => {
  const { trainName } = req.params;

  if (!trainName) {
    return res.status(400).json({ message: 'TrainName is required.' });
  }

  // Use FULLTEXT search with MATCH() AGAINST()
  const qry: string = `
    SELECT * FROM Train 
    WHERE MATCH(trainName) 
    AGAINST (? IN NATURAL LANGUAGE MODE)
  `;
  
  db.query(qry, [trainName], (err: MysqlError | null, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error Fetching Train Data.', err });
    }
    res.status(200).json({ results });
  });
});


// Get available seats for a train
router.get('/seats/:trainid', (req: Request<{ trainid: string }>, res: Response) => {
  const { trainid } = req.params;
  
  if (!trainid) {
    return res.status(400).json({ message: 'Train ID is required.' });
  }

  const query = 'SELECT seats FROM Seats WHERE trainid = ?';
  db.query(query, [trainid], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching seats.', err });
    if (results.length === 0) return res.status(404).json({ message: 'Seats not found for this train.' });

    const seats = JSON.parse(results[0].seats);
    const availableSeats = Object.keys(seats).filter(key => seats[key] === 'not booked');
    res.json({ availableSeats });
  });
});

// Book a ticket
router.post('/book-ticket/:trainid/:seatNo', (req: Request<{ trainid: string, seatNo: string }>, res: Response) => {
  const { trainid, seatNo } = req.params;
  const userId = (req as any).user?.userId;

  if (!trainid || !seatNo || !userId) {
    return res.status(400).json({ message: 'Train ID, seat number, and user ID are required.' });
  }

  // First, check if the seat is available
  const getSeatQuery = 'SELECT seats FROM Seats WHERE trainid = ?';
  db.query(getSeatQuery, [trainid], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching seat information.', err });
    if (results.length === 0) return res.status(404).json({ message: 'Seats not found for this train.' });

    const seats = JSON.parse(results[0].seats);

    if (seats[seatNo] !== 'not booked') {
      return res.status(400).json({ message: 'Seat is already booked.' });
    }

    // Update the seat status to booked
    seats[seatNo] = 'booked';
    const updateSeatQuery = 'UPDATE Seats SET seats = ? WHERE trainid = ?';
    db.query(updateSeatQuery, [JSON.stringify(seats), trainid], (err: MysqlError | null) => {
      if (err) return res.status(500).json({ message: 'Error updating seat status.', err });

      // Insert the booking into the Ticket table
      const bookTicketQuery = 'INSERT INTO Ticket (userid, trainid, seatNo) VALUES (?, ?, ?)';
      db.query(bookTicketQuery, [userId, trainid, seatNo], (err: MysqlError | null, results) => {
        if (err) return res.status(500).json({ message: 'Error booking ticket.', err });
        res.status(201).json({ message: 'Ticket booked successfully.', ticketId: results.insertId });
      });
    });
  });
});

export default router;
