var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import db from './DB.js'; // Ensure you have proper TypeScript types for DB connections
const queryAsync = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    });
};
function insertSeatsData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch all trains and their maxSeatsAvailable
            const trains = yield queryAsync('SELECT trainid, maxSeatsAvailable FROM Train');
            for (const train of trains) {
                const { trainid, maxSeatsAvailable } = train;
                // Generate JSON data for all seats
                const seats = {};
                for (let i = 1; i <= maxSeatsAvailable; i++) {
                    seats[i.toString()] = 'not booked';
                }
                // Convert the seats object to JSON string
                const seatsJson = JSON.stringify(seats);
                // Insert or update the seats data in the Seats table
                yield queryAsync(`INSERT INTO Seats (trainid, seats) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE seats = VALUES(seats)`, [trainid, seatsJson]);
                console.log(`Seats data for train ${trainid} inserted/updated successfully.`);
            }
        }
        catch (error) {
            console.error('Error during insertSeatsData:', error);
        }
    });
}
insertSeatsData();
