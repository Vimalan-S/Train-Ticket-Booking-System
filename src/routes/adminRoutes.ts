import db from '../DB.js';

import express, { Request, Response } from 'express';
import { MysqlError } from 'mysql';

const router = express.Router();

// Define the request body type for adding a new train
interface AddTrainRequestBody {
  trainName: string;
  maxSeatsAvailable: number;
  startLocation: string;
  endLocation: string;
}

// Route to add a new train
router.post('/add-train', (req: Request<{}, {}, AddTrainRequestBody>, 
                           res: Response) => {
/* Here Request does not take anything from params... So params = {}
        Request does not do anything from the response body... So resBody = {}
        Request should follow TrainReqBody interface...
*/
  const { trainName, maxSeatsAvailable, startLocation, endLocation } = req.body;

  // Validate required fields
  if (!trainName || maxSeatsAvailable === undefined || !startLocation || !endLocation) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = 'INSERT INTO Train (trainName, maxSeatsAvailable, startLocation, endLocation) VALUES (?, ?, ?, ?)';
  db.query(query, [trainName, maxSeatsAvailable, startLocation, endLocation], (err: MysqlError | null, results) => {
    if (err) return res.status(500).json({ message: 'Error adding train.', err });
    res.status(201).json({ message: 'Train added successfully.' });
  });
});

export default router;
