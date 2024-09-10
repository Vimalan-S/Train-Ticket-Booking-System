var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import db from './DB.js';
// Queries
const usersQuery = 'SELECT * FROM User';
const trainsQuery = 'SELECT * FROM Train';
const ticketsQuery = 'SELECT * FROM Ticket';
// Helper function to execute queries
const queryDatabase = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};
// Execute all queries
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch users
        const users = yield queryDatabase(usersQuery);
        console.log('Users:');
        console.table(users);
        // Fetch trains
        const trains = yield queryDatabase(trainsQuery);
        console.log('Trains:');
        console.table(trains);
        // Fetch tickets
        const tickets = yield queryDatabase(ticketsQuery);
        console.log('Tickets:');
        console.table(tickets);
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
    finally {
        db.end();
    }
});
// Run the fetchData function
fetchData();
