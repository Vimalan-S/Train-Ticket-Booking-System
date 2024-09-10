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

// Book a ticket
router.post('/book-ticket/:trainId', (req: Request<{ trainId: string }>, res: Response) => {
  const { trainId } = req.params;
  const userId = (req as any).user?.userId; 
  /* req as any tells ts to treat req to be having any type..
     .user is used to access req.user if exists
     ?.userId is optionally used to get id if userId exists on the req.user
  */

  if (!trainId || !userId) {
    return res.status(400).json({ message: 'Train ID and user ID are required.' });
  }

  const bookTicketQuery = 'INSERT INTO Ticket (userid, trainid) VALUES (?, ?)';
  db.query(bookTicketQuery, [userId, trainId], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error booking ticket.', err });
    res.status(201).json({ message: 'Ticket booked successfully.', ticketId: results.insertId });
  });
});

export default router;
