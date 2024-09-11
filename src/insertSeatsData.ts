import db from './DB.js'; // Ensure you have proper TypeScript types for DB connections
import { MysqlError } from 'mysql'; // Add MySQL types

const queryAsync = (query: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err: MysqlError | null, results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
};
  
async function insertSeatsData() {
    try {
      // Fetch all trains and their maxSeatsAvailable
      const trains = await queryAsync('SELECT trainid, maxSeatsAvailable FROM Train');
      
      for (const train of trains) {
        const { trainid, maxSeatsAvailable } = train;
        
        // Generate JSON data for all seats
        const seats: Record<string, string> = {};
        for (let i = 1; i <= maxSeatsAvailable; i++) {
          seats[i.toString()] = 'not booked';
        }
        
        // Convert the seats object to JSON string
        const seatsJson = JSON.stringify(seats);
        
        // Insert or update the seats data in the Seats table
        await queryAsync(
          `INSERT INTO Seats (trainid, seats) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE seats = VALUES(seats)`,
          [trainid, seatsJson]
        );
        console.log(`Seats data for train ${trainid} inserted/updated successfully.`);
      }
    } catch (error) {
      console.error('Error during insertSeatsData:', error);
    }
}
  
insertSeatsData();