var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Import the database connection
import db from './DB.js'; // Ensure DB.ts is correctly configured and exported
// SQL queries to create tables
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS User (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobilenumber VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other'),
    role ENUM('admin', 'regular') NOT NULL
  )
`;
const createTrainsTable = `
  CREATE TABLE IF NOT EXISTS Train (
    trainid INT AUTO_INCREMENT PRIMARY KEY,
    trainName VARCHAR(255) NOT NULL,
    maxSeatsAvailable INT NOT NULL,
    startLocation VARCHAR(255) NOT NULL,
    endLocation VARCHAR(255) NOT NULL
  )
`;
const createTicketsTable = `
  CREATE TABLE IF NOT EXISTS Ticket (
    ticketid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT,
    trainid INT,
    FOREIGN KEY (userid) REFERENCES User(userid),
    FOREIGN KEY (trainid) REFERENCES Train(trainid)
  )
`;
const queryAsync = (query) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        db.query(query, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
});
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield queryAsync(createUsersTable);
            console.log('User table created or already exists.');
            yield queryAsync(createTrainsTable);
            console.log('Train table created or already exists.');
            yield queryAsync(createTicketsTable);
            console.log('Ticket table created or already exists.');
        }
        catch (error) {
            console.error('Error creating tables:', error);
        }
        finally {
            db.end(); // Close the database connection
        }
    });
}
// Call the async function to execute the code
createTables();
